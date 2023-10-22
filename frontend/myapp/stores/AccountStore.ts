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
import { AccountInterface } from "../constants/interfaces";

@model("myApp/Account")
export class Account extends Model({
  id: prop<string>(""),
  name: prop<string>(""),
  datetime_added: prop<string>(""),
}) {
  get asJson() {
    return {
      id: this.id,
      name: this.name,
      datetime_added: this.datetime_added,
    };
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
  accountName(id: string) {
    return this.accounts.find((s) => s.id === id)?.name;
  }

  @modelAction
  accountId(name: string) {
    return this.accounts.find((s) => s.name === name)?.id;
  }

  @modelFlow
  fetchAccounts = _async(function* (this: AccountStore) {
    let token: string;

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    let response: Response;

    response = yield* _await(
      fetch(`${process.env["BASE_URL"]}/accounts/`, {
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

    let json: AccountInterface[];
    try {
      const resp = yield* _await(response.json());
      json = resp;
    } catch (error) {
      console.error("Parsing Error", error);
      return { details: "Parsing Error", ok: false, data: null };
    }

    json.forEach((s) => {
      if (!this.allIDs.includes(s.id ?? "-1")) {
        this.accounts.push(new Account(s));
      }
    });

    return { details: "", ok: true, data: json };
  });

  @modelFlow
  addAccount = _async(function* (
    this: AccountStore,
    details: AccountInterface
  ) {
    let token: string;

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    let response: Response;

    response = yield* _await(
      fetch(`${process.env["BASE_URL"]}/accounts/`, {
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

    let json: AccountInterface;
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
