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

export interface TransactionInterface {
  id?: number;
  description?: string;
  amount?: number;
  datetime_transacted?: string;
  category?: number;
  encoder?: string;
  transmitter?: number;
  receiver?: number;
}

@model("myApp/Transaction")
export class Transaction extends Model({
  id: prop<number>(-1),
  description: prop<string>(""),
  amount: prop<number>(0),
  datetime_transacted: prop<string>(""),
  category: prop<number>(-1),
  encoder: prop<string>(""),
  transmitter: prop<number>(-1),
  receiver: prop<number>(-1),
}) {
  update(details: TransactionInterface) {
    Object.assign(this, details);
  }
}

@model("myApp/TransactionStore")
export class TransactionStore extends Model({
  transactions: prop<Transaction[]>(() => []),
}) {
  get allIDs() {
    return this.transactions.map((s) => s.id);
  }

  @modelAction
  getItem(id: number) {
    return this.transactions.find((s) => s.id === id);
  }

  @modelFlow
  fetchAnalytics = _async(function* (
    this: TransactionStore,
    filters: {
      range: string;
    }
  ) {
    let token: string;

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    let response: Response;

    response = yield* _await(
      fetch(
        `${process.env["BASE_URL"]}/transactions/?analytics=1&range=${filters.range}`,
        {
          method: "GET",
          headers: {
            "Content-type": "application/json",
            Authorization: `Token ${token}`,
          },
        }
      )
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

    let json: {
      adjustments_added: number;
      adjustments_deducted: number;
      operating_expenses: number;
      other_incomes: number;
    };
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
      fetch(`${process.env["BASE_URL"]}/transactions/${query}`, {
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

    let json: Transaction[];
    try {
      const resp = yield* _await(response.json());

      json = resp;
    } catch (error) {
      console.error("Parsing Error", error);
      return { details: "Parsing Error", ok: false, data: null };
    }

    json.forEach((s) => {
      if (!this.allIDs.includes(s.id)) {
        this.transactions.push(new Transaction(s));
      } else {
        this.transactions.find((t) => t.id === s.id)?.update(s);
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
      fetch(`${process.env["BASE_URL"]}/transactions/`, {
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

    let json: Transaction;
    try {
      const resp = yield* _await(response.json());
      json = resp;
    } catch (error) {
      console.error("Parsing Error", error);
      return { details: "Parsing Error", ok: false, data: null };
    }

    let transaction: Transaction;

    transaction = new Transaction(json);

    this.transactions.push(transaction);

    return { details: "", ok: true, data: transaction };
  });

  @modelFlow
  updateItem = _async(function* (
    this: TransactionStore,
    transactionId: number,
    details: TransactionInterface
  ) {
    let token: string;

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    let response: Response;

    response = yield* _await(
      fetch(`${process.env["BASE_URL"]}/transactions/${transactionId}/`, {
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

    let json: Transaction;
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
      fetch(`${process.env["BASE_URL"]}/transactions/${transactionId}/`, {
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
