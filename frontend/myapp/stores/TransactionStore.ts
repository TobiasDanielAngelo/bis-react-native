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

export interface Transaction2Interface {
  id?: number;
  description?: string;
  amount?: number;
  datetime_transacted?: string;
  category?: number;
  encoder?: string;
  transmitter?: number;
  receiver?: number;
}

@model("myApp/Transaction2")
export class Transaction2 extends Model({
  id: prop<number>(-1),
  description: prop<string>(""),
  amount: prop<number>(0),
  datetime_transacted: prop<string>(""),
  category: prop<number>(-1),
  encoder: prop<string>(""),
  transmitter: prop<number>(-1),
  receiver: prop<number>(-1),
}) {
  get asJson() {
    return {
      id: this.id,
      description: this.description,
      amount: this.amount,
      datetime_transacted: this.datetime_transacted,
      category: this.category,
      encoder: this.encoder,
      transmitter: this.transmitter,
      receiver: this.receiver,
    };
  }

  update(details: Transaction2Interface) {
    this.description = details.description ?? this.description;
    this.amount = details.amount ?? this.amount;
    this.datetime_transacted =
      details.datetime_transacted ?? this.datetime_transacted;
    this.category = details.category ?? this.category;
    this.encoder = details.encoder ?? this.encoder;
    this.transmitter = details.transmitter ?? this.transmitter;
    this.receiver = details.receiver ?? this.receiver;
    return this;
  }
}

@model("myApp/TransactionStore")
export class TransactionStore extends Model({
  transactions: prop<Transaction2[]>(() => []),
}) {
  get allIDs() {
    return this.transactions.map((s) => s.id);
  }

  @modelAction
  getItem(id: number) {
    return this.transactions.find((s) => s.id === id);
  }

  @modelFlow
  fetchAll = _async(function* (
    this: TransactionStore,
    filters?: {
      startDate?: string;
      endDate?: string;
      ids?: number[];
      isActive?: boolean;
      category?: number;
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
      if (filters?.category) queryFilters.push(`category=${filters?.category}`);
    }

    if (queryFilters.length > 0) {
      query = "?" + queryFilters.join("&");
    }

    let token: string;

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    let response: Response;

    response = yield* _await(
      fetch(`${process.env["BASE_URL"]}/transactions2/${query}`, {
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

    let json: Transaction2[];
    try {
      const resp = yield* _await(response.json());

      json = resp;
    } catch (error) {
      console.error("Parsing Error", error);
      return { details: "Parsing Error", ok: false, data: null };
    }

    json.forEach((s) => {
      if (!this.allIDs.includes(s.id)) {
        this.transactions.push(new Transaction2(s));
      } else {
        this.transactions
          .find((t) => t.id === s.id)
          ?.update({
            description: s.description,
            amount: s.amount,
            datetime_transacted: s.datetime_transacted,
            category: s.category,
            encoder: s.encoder,
            transmitter: s.transmitter,
            receiver: s.receiver,
          });
      }
    });

    return { details: "", ok: true, data: json };
  });

  @modelFlow
  fetchSome = _async(function* (this: TransactionStore, ids: number[]) {
    let token: string;

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    let response: Response;

    response = yield* _await(
      fetch(`${process.env["BASE_URL"]}/transactions2/?ids=${ids.join("+")}`, {
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

    let json: Transaction2[];
    try {
      const resp = yield* _await(response.json());

      json = resp;
    } catch (error) {
      console.error("Parsing Error", error);
      return { details: "Parsing Error", ok: false, data: null };
    }

    json.forEach((s) => {
      if (!this.allIDs.includes(s.id)) {
        this.transactions.push(new Transaction2(s));
      } else {
        this.transactions
          .find((t) => t.id === s.id)
          ?.update({
            description: s.description,
            amount: s.amount,
            datetime_transacted: s.datetime_transacted,
            category: s.category,
            encoder: s.encoder,
            transmitter: s.transmitter,
            receiver: s.receiver,
          });
      }
    });

    return { details: "", ok: true, data: json };
  });

  @modelFlow
  addItem = _async(function* (
    this: TransactionStore,
    details: {
      description: string;
      amount: number;
      category: number;
      transmitter: number;
      receiver: number;
    }
  ) {
    const user = JSON.parse(
      (yield* _await(AsyncStorage.getItem("@currentUser"))) ?? ""
    );

    const transactionDetails = {
      category: details.category,
      encoder: user?.user_id,
      datetime_transacted: new Date().toISOString(),
      amount: details.amount,
      description: details.description,
      transmitter: details.transmitter,
      receiver: details.receiver,
    };

    let token: string;

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    let response: Response;

    response = yield* _await(
      fetch(`${process.env["BASE_URL"]}/transactions2/`, {
        method: "POST",
        body: JSON.stringify(transactionDetails),
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

    let json: Transaction2;
    try {
      const resp = yield* _await(response.json());
      json = resp;
    } catch (error) {
      console.error("Parsing Error", error);
      return { details: "Parsing Error", ok: false, data: null };
    }

    let transaction: Transaction2;

    transaction = new Transaction2(json);

    this.transactions.push(transaction);

    return { details: "", ok: true, data: transaction };
  });

  @modelFlow
  updateItem = _async(function* (
    this: TransactionStore,
    transactionId: number,
    details: Transaction2Interface
  ) {
    let token: string;

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    let response: Response;

    response = yield* _await(
      fetch(`${process.env["BASE_URL"]}/transactions2/${transactionId}/`, {
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

    let json: Transaction2;
    try {
      const resp = yield* _await(response.json());
      json = resp;
    } catch (error) {
      console.error("Parsing Error", error);
      return { details: "Parsing Error", ok: false, data: null };
    }

    const transactionObj = this.transactions
      .find((s) => s.id === transactionId)
      ?.update(json);

    return { details: "", ok: true, data: transactionObj };
  });

  @modelFlow
  deleteItem = _async(function* (
    this: TransactionStore,
    transactionId: number
  ) {
    let token: string;

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    let response: Response;

    response = yield* _await(
      fetch(`${process.env["BASE_URL"]}/transactions2/${transactionId}/`, {
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

    const indexOfItem = this.transactions.findIndex(
      (s) => s.id === transactionId
    );

    this.transactions.splice(indexOfItem, 1);

    return { details: "", ok: true, data: null };
  });
}

export const transactionStore = new TransactionStore({});
