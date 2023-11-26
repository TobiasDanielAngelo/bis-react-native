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
  get asJson() {
    return {
      id: this.id,
      payment: this.payment,
      borrower_name: this.borrower_name,
      description: this.description,
      lent_amount: this.lent_amount,
      datetime_opened: this.datetime_opened,
      datetime_due: this.datetime_due,
      datetime_closed: this.datetime_closed,
      is_active: this.is_active,
      user_opener: this.user_opener,
      user_closer: this.user_closer,
    };
  }

  update(details: ReceivableInterface) {
    this.payment = details.payment ?? this.payment;
    this.borrower_name = details.borrower_name ?? this.borrower_name;
    this.lent_amount = details.lent_amount ?? this.lent_amount;
    this.description = details.description ?? this.description;
    this.datetime_opened = details.datetime_opened ?? this.datetime_opened;
    this.datetime_due = details.datetime_due ?? this.datetime_due;
    this.datetime_closed = details.datetime_closed ?? this.datetime_closed;
    this.is_active = details.is_active ?? this.is_active;
    this.user_opener = details.user_opener ?? this.user_opener;
    this.user_closer = details.user_closer ?? this.user_closer;
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

    let token: string;

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    let response: Response;

    response = yield* _await(
      fetch(`${process.env["BASE_URL"]}/receivables/${query}`, {
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
        this.receivables
          .find((t) => t.id === s.id ?? -1)
          ?.update({
            id: s.id,
            payment: s.payment,
            borrower_name: s.borrower_name,
            lent_amount: s.lent_amount,
            datetime_opened: s.datetime_opened,
            description: s.description,
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
  fetchOne = _async(function* (this: ReceivableStore, id: number) {
    let token: string;

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    let response: Response;

    response = yield* _await(
      fetch(`${process.env["BASE_URL"]}/receivables/${id}/`, {
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
      this.receivables
        .find((t) => t.id === id ?? -1)
        ?.update({
          id: json.id,
          payment: json.payment,
          borrower_name: json.borrower_name,
          lent_amount: json.lent_amount,
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
    this: ReceivableStore,
    details: {
      borrower_name: string;
      lent_amount: number;
      description: string;
      datetime_due: string;
    }
  ) {
    const user = JSON.parse(
      (yield* _await(AsyncStorage.getItem("@currentUser"))) ?? ""
    );

    let token: string;

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    const receivableDetails = {
      user_opener: user?.user_id,
      ...details,
    };

    let response: Response;

    response = yield* _await(
      fetch(`${process.env["BASE_URL"]}/receivables/`, {
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
    details: {
      payment?: number[];
      borrower_name?: string;
      lent_amount?: number;
      description?: string;
      datetime_opened?: string;
      datetime_due?: string;
      datetime_closed?: string;
      is_active?: boolean;
      user_opener?: string;
      user_closer?: string;
    }
  ) {
    this.receivables
      .find((s) => receivableId === s.id ?? -1)
      ?.update({
        payment: details.payment,
        borrower_name: details.borrower_name,
        lent_amount: details.lent_amount,
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
      fetch(`${process.env["BASE_URL"]}/receivables/${receivableId}/`, {
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

    return { details: "", ok: true, data: json };
  });

  @modelFlow
  deleteItem = _async(function* (this: ReceivableStore, id: number) {
    let token: string;

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    let response: Response;

    response = yield* _await(
      fetch(`${process.env["BASE_URL"]}/receivables/${id}/`, {
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
