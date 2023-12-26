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

export interface ReceivableInterface {
  id?: number;
  payment?: number[];
  borrower_name?: string;
  description?: string;
  lent_amount?: number;
  datetime_opened?: string;
  datetime_due?: string;
  datetime_closed?: string;
  is_active?: boolean;
  user_opener?: string;
  user_closer?: string;
}

@model("myApp/Receivable")
export class Receivable extends Model({
  id: prop<number>(-1),
  payment: prop<number[]>(),
  borrower_name: prop<string>(""),
  lent_amount: prop<number>(0),
  description: prop<string>(""),
  datetime_opened: prop<string>(""),
  datetime_due: prop<string>(""),
  datetime_closed: prop<string>(""),
  is_active: prop<boolean>(true),
  user_opener: prop<string>(""),
  user_closer: prop<string>(""),
}) {
  update(details: ReceivableInterface) {
    Object.assign(this, details);
    return this;
  }
}

@model("myApp/ReceivableStore")
export class ReceivableStore extends Model({
  receivables: prop<Receivable[]>(() => []),
}) {
  get allIDs() {
    return this.receivables.map((s) => s.id);
  }

  @modelAction
  getItem(id: number) {
    return this.receivables.find((s) => s.id === id);
  }

  @modelFlow
  fetchAll = _async(function* (
    this: ReceivableStore,
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
      fetch(`${url}/receivables/${query}`, {
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

    let json: Receivable[];
    try {
      const resp = yield* _await(response.json());
      json = resp;
    } catch (error) {
      console.error("Parsing Error", error);
      return { details: "Parsing Error", ok: false, data: null };
    }

    json.forEach((s) => {
      if (!this.allIDs.includes(s.id ?? -1)) {
        this.receivables.push(new Receivable(s));
      } else {
        this.receivables.find((t) => t.id === s.id ?? -1)?.update(s);
      }
    });

    return { details: "", ok: true, data: json };
  });

  @modelFlow
  fetchOne = _async(function* (this: ReceivableStore, id: number) {
    let url: string;

    url = (yield* _await(AsyncStorage.getItem("@apiUrl"))) ?? "";

    let token: string;

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    let response: Response;

    response = yield* _await(
      fetch(`${url}/receivables/${id}/`, {
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

    let json: Receivable;
    try {
      const resp = yield* _await(response.json());
      json = resp;
    } catch (error) {
      console.error("Parsing Error", error);
      return { details: "Parsing Error", ok: false, data: null };
    }

    if (!this.allIDs.includes(id ?? -1)) {
      this.receivables.push(new Receivable(json));
    } else {
      this.receivables.find((t) => t.id === id ?? -1)?.update(json);
    }

    return { details: "", ok: true, data: json };
  });

  @modelFlow
  addItem = _async(function* (
    this: ReceivableStore,
    details: ReceivableInterface
  ) {
    const user = JSON.parse(
      (yield* _await(AsyncStorage.getItem("@currentUser"))) ?? ""
    );

    let url: string;

    url = (yield* _await(AsyncStorage.getItem("@apiUrl"))) ?? "";

    let token: string;

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    const receivableDetails = {
      user_opener: user?.user_id,
      ...details,
    };

    let response: Response;

    response = yield* _await(
      fetch(`${url}/receivables/`, {
        method: "POST",
        body: JSON.stringify(receivableDetails),
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

    let json: Receivable;
    try {
      const resp = yield* _await(response.json());
      json = resp;
    } catch (error) {
      console.error("Parsing Error", error);
      return { details: "Parsing Error", ok: false, data: null };
    }

    let receivable: Receivable;

    receivable = new Receivable(json);

    this.receivables.push(receivable);

    return { details: "", ok: true, data: receivable };
  });

  @modelFlow
  updateItem = _async(function* (
    this: ReceivableStore,
    receivableId: number,
    details: ReceivableInterface
  ) {
    let url: string;

    url = (yield* _await(AsyncStorage.getItem("@apiUrl"))) ?? "";

    let token: string;

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    let response: Response;

    response = yield* _await(
      fetch(`${url}/receivables/${receivableId}/`, {
        method: "PATCH",
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

    let json: Receivable;
    try {
      const resp = yield* _await(response.json());
      json = resp;
    } catch (error) {
      console.error("Parsing Error", error);
      return { details: "Parsing Error", ok: false, data: null };
    }

    this.getItem(receivableId)?.update(details);

    return { details: "", ok: true, data: json };
  });

  @modelFlow
  deleteItem = _async(function* (this: ReceivableStore, id: number) {
    let url: string;

    url = (yield* _await(AsyncStorage.getItem("@apiUrl"))) ?? "";

    let token: string;

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    let response: Response;

    response = yield* _await(
      fetch(`${url}/receivables/${id}/`, {
        method: "DELETE",
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

    const indexOfItem = this.receivables.findIndex((s) => s.id === id);

    this.receivables.splice(indexOfItem, 1);

    return { details: "", ok: true, data: null };
  });
}

export const receivableStore = new ReceivableStore({});
