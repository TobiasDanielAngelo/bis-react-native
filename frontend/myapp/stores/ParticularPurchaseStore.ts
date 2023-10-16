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
import { ParticularTransaction } from "../constants/interfaces";

@model("myApp/ParticularPurchase")
export class ParticularPurchase extends Model({
  id: prop<string>(""),
  description: prop<string>(""),
  remarks: prop<string>(""),
  quantity: prop<number>(0),
  unit_amount: prop<number>(0),
  transaction: prop<number>(0),
}) {
  get asJson() {
    return {
      id: this.id,
      description: this.description,
      remarks: this.remarks,
      quantity: this.quantity,
      unit_amount: this.unit_amount,
      transaction: this.transaction,
    };
  }

  update(details: ParticularTransaction) {
    this.id = details.id ?? this.id;
    this.description = details.description ?? this.description;
    this.remarks = details.remarks ?? this.remarks;
    this.quantity = details.quantity ?? this.quantity;
    this.unit_amount = details.unit_amount ?? this.unit_amount;
    this.transaction = details.transaction ?? this.transaction;
    return this;
  }
}

@model("myApp/ParticularPurchaseStore")
export class ParticularPurchaseStore extends Model({
  particulars: prop<ParticularPurchase[]>(() => []),
}) {
  get allIDs() {
    return this.particulars.map((s) => s.id);
  }

  @modelAction
  deleteParticularsHistory() {
    this.particulars.splice(0, this.particulars.length);
  }

  @modelFlow
  fetchParticularTransactions = _async(function* (
    this: ParticularPurchaseStore
  ) {
    let token: string;

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    let response: Response;

    response = yield* _await(
      fetch(`${process.env["BASE_URL"]}/particularorders/`, {
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

    let json: ParticularTransaction[];
    try {
      const resp = yield* _await(response.json());
      json = resp;
    } catch (error) {
      console.error("Parsing Error", error);
      return { details: "Parsing Error", ok: false, data: null };
    }

    json.forEach((s) => {
      if (!this.allIDs.includes(s.id ?? "-1")) {
        this.particulars.push(new ParticularPurchase(s));
      }
    });

    return { details: "", ok: true, data: json };
  });

  @modelFlow
  addParticularPurchase = _async(function* (
    this: ParticularPurchaseStore,
    details: ParticularTransaction,
    transaction: number
  ) {
    const particularDetails = {
      transaction: transaction,
      description: details.description,
      remarks: details.remarks,
      quantity: details.quantity,
      unit_amount: details.unit_amount,
    };

    let token: string;

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    let response: Response;

    response = yield* _await(
      fetch(`${process.env["BASE_URL"]}/particularorders/`, {
        method: "POST",
        body: JSON.stringify(particularDetails),
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

    let json: ParticularPurchase;
    try {
      const resp = yield* _await(response.json());
      json = resp;
    } catch (error) {
      console.error("Parsing Error", error);
      return { details: "Parsing Error", ok: false, data: null };
    }

    let particular: ParticularPurchase;

    particular = new ParticularPurchase(json);

    return { details: "", ok: true, data: particular };
  });

  @modelFlow
  updateParticularPurchase = _async(function* (
    this: ParticularPurchaseStore,
    pk: string,
    details: ParticularTransaction
  ) {
    let token: string;

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    let response: Response;

    response = yield* _await(
      fetch(`${process.env["BASE_URL"]}/particularorders/${pk}/`, {
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

    let json: ParticularPurchase;
    try {
      const resp = yield* _await(response.json());
      json = resp;
    } catch (error) {
      console.error("Parsing Error", error);
      return { details: "Parsing Error", ok: false, data: null };
    }

    const particularObj = this.particulars
      .find((s) => `${s.id}` === `${pk}`)
      ?.update(json);

    return { details: "", ok: true, data: particularObj };
  });

  @modelFlow
  deleteParticularPurchase = _async(function* (
    this: ParticularPurchaseStore,
    pk: string
  ) {
    let token: string;

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    let response: Response;

    response = yield* _await(
      fetch(`${process.env["BASE_URL"]}/particularorders/${pk}/`, {
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

    const indexOfItem = this.particulars.findIndex((s) => s.id === pk);

    this.particulars.splice(indexOfItem, 1);

    return { details: "", ok: true, data: null };
  });
}

export const particularPurchaseStore = new ParticularPurchaseStore({});
