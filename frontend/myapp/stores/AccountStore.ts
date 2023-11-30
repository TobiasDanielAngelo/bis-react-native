import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Model,
  _async,
  _await,
  model,
  modelAction,
  modelFlow,
  prop,
} from "mobx-keystone";

interface AccountInterface {
  id?: number;
  name?: string;
  datetime_added?: string;
  transmitted?: number;
  received?: number;
}

@model("myApp/Account")
export class Account extends Model({
  id: prop<number>(-1),
  name: prop<string>(""),
  datetime_added: prop<string>(""),
  transmitted: prop<number>(0),
  received: prop<number>(0),
}) {
  update(details: AccountInterface) {
    Object.assign(this, details);
  }
}

@model("myApp/AccountStore")
export class AccountStore extends Model({
  accounts: prop<Account[]>(() => []),
}) {
  get allIDs() {
    return this.accounts.map((s) => s.id);
  }

  @modelAction
  getItem(id?: number) {
    if (!id) return;
    return this.accounts.find((s) => s.id === id);
  }

  @modelFlow
  fetchAll = _async(function* (
    this: AccountStore,
    filters?: {
      startDate?: string;
      endDate?: string;
      ids?: number[];
      isActive?: boolean;
    }
  ) {
    let queryFilters: string[] = [];
    let query: string = "";

    if (filters) {
      if (filters.startDate)
        queryFilters.push(`start_date=${filters.startDate}`);
      if (filters?.endDate) queryFilters.push(`end_date=${filters.endDate}`);
      if (filters?.ids) queryFilters.push(`ids=${filters.ids.join("+")}`);
      if (filters?.isActive)
        queryFilters.push(`is_active=${filters?.isActive ? "true" : "false"}`);
    }

    if (queryFilters.length > 0) {
      query = "?" + queryFilters.join("&");
    }

    let url: string;

    url = (yield* _await(AsyncStorage.getItem("@apiUrl"))) ?? "";

    let token: string;

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    let response: Response;

    response = yield* _await(
      fetch(`${url}/accounts/${query}`, {
        method: "GET",
        headers: {
          "Content-type": "application/json",
          Authorization: `Token ${token}`,
        },
      })
    );

    if (!response.ok) {
      let msg: any = yield* _await(response.json());
      if (msg.non_field_errors) {
        return {
          details: `${msg.non_field_errors}`,
          ok: false,
          data: null,
        };
      }
      return { details: `${msg.error}`, ok: false, data: null };
    }

    let json: Account[];
    try {
      const resp = yield* _await(response.json());
      json = resp;
    } catch (error) {
      console.error("Parsing Error", error);
      return { details: "Parsing Error", ok: false, data: null };
    }

    json.forEach((s) => {
      if (!this.allIDs.includes(s.id ?? -1)) {
        this.accounts.push(new Account(s));
      } else {
        this.getItem(s.id)?.update(s);
      }
    });

    return { details: "", ok: true, data: json };
  });

  @modelFlow
  addItem = _async(function* (
    this: AccountStore,
    details: {
      name: string;
    }
  ) {
    let url: string;

    url = (yield* _await(AsyncStorage.getItem("@apiUrl"))) ?? "";

    let token: string;

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    let response: Response;

    response = yield* _await(
      fetch(`${url}/accounts/`, {
        method: "POST",
        body: JSON.stringify(details),
        headers: {
          "Content-type": "application/json",
          Authorization: `Token ${token}`,
        },
      })
    );

    if (!response.ok) {
      let msg: any = yield* _await(response.json());
      if (msg.non_field_errors) {
        return {
          details: `${msg.non_field_errors}`,
          ok: false,
          data: null,
        };
      }
      return { details: `${msg.error}`, ok: false, data: null };
    }

    let json: Account;
    try {
      const resp = yield* _await(response.json());
      json = resp;
    } catch (error) {
      console.error("Parsing Error", error);
      return { details: "Parsing Error", ok: false, data: null };
    }

    let account: Account;

    account = new Account(json);

    this.accounts.push(account);

    return { details: "", ok: true, data: account };
  });
}

export const accountStore = new AccountStore({});
