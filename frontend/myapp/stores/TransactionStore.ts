import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  model,
  Model,
  modelFlow,
  prop,
  _async,
  _await,
  modelAction,
} from "mobx-keystone";
import {
  ParticularTransaction,
  TransactionInputInterface,
  TransactionInterface,
  TransactionUpdateInterface,
} from "../constants/interfaces";

@model("myApp/Transaction")
export class Transaction extends Model({
  pk: prop<string>(""),
  category: prop<string>(""),
  description: prop<string>(""),
  datetime_transacted: prop<string>(""),
  encoder: prop<string>(""),
  transmitter: prop<string>(""),
  receiver: prop<string>(""),
  particular_transaction: prop<ParticularTransaction[]>(),
}) {
  get asJson() {
    return {
      pk: this.pk,
      category: this.category,
      description: this.description,
      encoder: this.encoder,
      transmitter: this.transmitter,
      receiver: this.receiver,
      datetime_transacted: this.datetime_transacted,
      particular_transaction: this.particular_transaction,
    };
  }

  update(details: TransactionInterface) {
    this.pk = details.pk ?? "-1";
    this.category = details.category;
    this.description = details.description;
    this.encoder = details.encoder;
    this.transmitter = details.transmitter;
    this.receiver = details.receiver;
    this.datetime_transacted = details.datetime_transacted;
    this.particular_transaction = details.particular_transaction;
    return this;
  }
}

@model("myApp/TransactionStore")
export class TransactionStore extends Model({
  transactions: prop<Transaction[]>(() => []),
}) {
  @modelAction
  deleteTransactionHistory() {
    this.transactions.splice(0, this.transactions.length);
  }

  @modelAction
  transactionDetails(pk: string) {
    return this.transactions.find((s) => `${s.pk}` === `${pk}`);
  }
  get allIDs() {
    return this.transactions.map((s) => s.pk);
  }

  get allParticularTransactions() {
    return this.transactions.map((s) => s.particular_transaction).flat(1);
  }

  @modelFlow
  fetchTransactions = _async(function* (this: TransactionStore, query: string) {
    let token: string;

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    let response: Response;

    response = yield* _await(
      fetch(`${process.env["BASE_URL"]}/${query}`, {
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

    let json: TransactionInterface[];
    try {
      const resp = yield* _await(response.json());

      json = resp;
    } catch (error) {
      console.error("Parsing Error", error);
      return { details: "Parsing Error", ok: false, data: null };
    }

    // If transaction was deleted, what happens?

    json.forEach((s) => {
      if (!this.allIDs.includes(s.pk ?? "-1")) {
        this.transactions.push(new Transaction(s));
      } else {
        this.transactions
          .find((t) => t.pk === s.pk ?? "-1")
          ?.update({
            pk: s.pk,
            category: s.category,
            description: s.description,
            datetime_transacted: s.datetime_transacted,
            encoder: s.encoder,
            transmitter: s.transmitter,
            receiver: s.receiver,
            particular_transaction: s.particular_transaction,
          });
      }
    });

    return { details: "", ok: true, data: json };
  });

  @modelFlow
  addTransaction = _async(function* (
    this: TransactionStore,
    details: TransactionInputInterface
  ) {
    const user = JSON.parse(
      (yield* _await(AsyncStorage.getItem("@currentUser"))) ?? ""
    );

    const transactionDetails = {
      category: details.category,
      encoder: user?.user_id,
      datetime_transacted: new Date().toISOString(),
      description: details.description,
      transmitter: details.transmitter,
      receiver: details.receiver,
      particular_transaction: details.particular_transaction,
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

    let json: TransactionInterface;
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
  updateTransaction = _async(function* (
    this: TransactionStore,
    pk: string,
    details: TransactionUpdateInterface
  ) {
    let token: string;

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    let response: Response;

    response = yield* _await(
      fetch(`${process.env["BASE_URL"]}/transactions/${pk}/`, {
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

    let json: TransactionInterface;
    try {
      const resp = yield* _await(response.json());
      json = resp;
    } catch (error) {
      console.error("Parsing Error", error);
      return { details: "Parsing Error", ok: false, data: null };
    }

    const transactionObj = this.transactions
      .find((s) => `${s.pk}` === `${pk}`)
      ?.update(json);

    return { details: "", ok: true, data: transactionObj };
  });

  @modelFlow
  deleteTransaction = _async(function* (this: TransactionStore, pk: string) {
    let token: string;

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    let response: Response;

    response = yield* _await(
      fetch(`${process.env["BASE_URL"]}/transactions/${pk}/`, {
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

    const indexOfItem = this.transactions.findIndex((s) => s.pk === pk);

    this.transactions.splice(indexOfItem, 1);

    return { details: "", ok: true, data: null };
  });
}

export const transactionStore = new TransactionStore({});
