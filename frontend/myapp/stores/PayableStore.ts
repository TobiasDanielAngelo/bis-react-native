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

export interface PayableInterface {
  id?: number;
  payment?: number[];
  lender_name?: string;
  borrowed_amount?: number;
  description?: string;
  datetime_opened?: string;
  datetime_due?: string;
  datetime_closed?: string;
  is_active?: boolean;
  user_opener?: string;
  user_closer?: string;
}

@model("myApp/Payable")
export class Payable extends Model({
  id: prop<number>(-1),
  payment: prop<number[]>(),
  lender_name: prop<string>(""),
  borrowed_amount: prop<number>(0),
  description: prop<string>(""),
  datetime_opened: prop<string>(""),
  datetime_due: prop<string>(""),
  datetime_closed: prop<string>(""),
  is_active: prop<boolean>(true),
  user_opener: prop<string>(""),
  user_closer: prop<string>(""),
}) {
  update(details: PayableInterface) {
    Object.assign(this, details);
  }
}

@model("myApp/PayableStore")
export class PayableStore extends Model({
  payables: prop<Payable[]>(() => []),
}) {
  get allIDs() {
    return this.payables.map((s) => s.id);
  }

  @modelAction
  getItem(id: number) {
    return this.payables.find((s) => s.id === id);
  }

  @modelFlow
  fetchAll = _async(function* (
    this: PayableStore,
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

    let token: string;

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    let response: Response;

    response = yield* _await(
      fetch(`http://192.168.254.197:8000/payables/${query}`, {
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

    let json: Payable[];
    try {
      const resp = yield* _await(response.json());
      json = resp;
    } catch (error) {
      console.error("Parsing Error", error);
      return { details: "Parsing Error", ok: false, data: null };
    }

    json.forEach((s) => {
      if (!this.allIDs.includes(s.id ?? -1)) {
        this.payables.push(new Payable(s));
      } else {
        this.payables
          .find((t) => t.id === s.id ?? -1)
          ?.update({
            id: s.id,
            payment: s.payment,
            lender_name: s.lender_name,
            borrowed_amount: s.borrowed_amount,
            description: s.description,
            datetime_opened: s.datetime_opened,
            datetime_due: s.datetime_due,
            datetime_closed: s.datetime_closed,
            is_active: s.is_active,
            user_opener: s.user_opener,
            user_closer: s.user_closer,
          });
      }
    });

    return { details: "", ok: true, data: json };
  });

  @modelFlow
  fetchOne = _async(function* (this: PayableStore, id: number) {
    let token: string;

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    let response: Response;

    response = yield* _await(
      fetch(`http://192.168.254.197:8000/payables/${id}/`, {
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

    let json: Payable;
    try {
      const resp = yield* _await(response.json());
      json = resp;
    } catch (error) {
      console.error("Parsing Error", error);
      return { details: "Parsing Error", ok: false, data: null };
    }

    if (!this.allIDs.includes(id ?? -1)) {
      this.payables.push(new Payable(json));
    } else {
      this.payables
        .find((t) => t.id === id ?? -1)
        ?.update({
          id: json.id,
          payment: json.payment,
          lender_name: json.lender_name,
          borrowed_amount: json.borrowed_amount,
          description: json.description,
          datetime_opened: json.datetime_opened,
          datetime_due: json.datetime_due,
          datetime_closed: json.datetime_closed,
          is_active: json.is_active,
          user_opener: json.user_opener,
          user_closer: json.user_closer,
        });
    }

    return { details: "", ok: true, data: json };
  });

  @modelFlow
  addItem = _async(function* (
    this: PayableStore,
    details: {
      lender_name: string;
      borrowed_amount: number;
      description: string;
      datetime_due: string;
    }
  ) {
    const user = JSON.parse(
      (yield* _await(AsyncStorage.getItem("@currentUser"))) ?? ""
    );

    let token: string;

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    const payableDetails = {
      user_opener: user?.user_id,
      ...details,
    };

    let response: Response;

    response = yield* _await(
      fetch(`http://192.168.254.197:8000/payables/`, {
        method: "POST",
        body: JSON.stringify(payableDetails),
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

    let json: Payable;
    try {
      const resp = yield* _await(response.json());
      json = resp;
    } catch (error) {
      console.error("Parsing Error", error);
      return { details: "Parsing Error", ok: false, data: null };
    }

    let payable: Payable;

    payable = new Payable(json);

    this.payables.push(payable);

    return { details: "", ok: true, data: payable };
  });

  @modelFlow
  updateItem = _async(function* (
    this: PayableStore,
    payableId: number,
    details: {
      payment?: number[];
      lender_name?: string;
      borrowed_amount?: number;
      description?: string;
      datetime_opened?: string;
      datetime_due?: string;
      datetime_closed?: string;
      is_active?: boolean;
      user_opener?: string;
      user_closer?: string;
    }
  ) {
    this.payables
      .find((s) => payableId === s.id ?? -1)
      ?.update({
        payment: details.payment,
        lender_name: details.lender_name,
        borrowed_amount: details.borrowed_amount,
        description: details.description,
        datetime_opened: details.datetime_opened,
        datetime_due: details.datetime_due,
        datetime_closed: details.datetime_closed,
        is_active: details.is_active,
        user_opener: details.user_opener,
        user_closer: details.user_closer,
      });

    let token: string;

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    let response: Response;

    response = yield* _await(
      fetch(`http://192.168.254.197:8000/payables/${payableId}/`, {
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

    let json: Payable;
    try {
      const resp = yield* _await(response.json());
      json = resp;
    } catch (error) {
      console.error("Parsing Error", error);
      return { details: "Parsing Error", ok: false, data: null };
    }

    return { details: "", ok: true, data: json };
  });

  @modelFlow
  deleteItem = _async(function* (this: PayableStore, id: number) {
    let token: string;

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    let response: Response;

    response = yield* _await(
      fetch(`http://192.168.254.197:8000/payables/${id}/`, {
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

    const indexOfItem = this.payables.findIndex((s) => s.id === id);

    this.payables.splice(indexOfItem, 1);

    return { details: "", ok: true, data: null };
  });
}

export const payableStore = new PayableStore({});
