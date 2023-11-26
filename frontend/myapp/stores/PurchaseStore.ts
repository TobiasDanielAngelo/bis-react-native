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
import { PurchaseItem } from "./PurchaseItemStore";

export interface PurchaseInterface {
  id?: number;
  supplier_name?: string;
  to_print?: boolean;
  status?: string;
  datetime_opened?: string;
  datetime_closed?: string;
  is_active?: boolean;
  user_adder?: string;
  user_closer?: string;
  purchase_item?: PurchaseItem[];
}

@model("myApp/Purchase")
export class Purchase extends Model({
  id: prop<number>(-1),
  supplier_name: prop<string>(""),
  status: prop<string>(""),
  to_print: prop<boolean>(false),
  datetime_opened: prop<string>(""),
  datetime_closed: prop<string>(""),
  is_active: prop<boolean>(true),
  user_adder: prop<string>(""),
  user_closer: prop<string>(""),
  purchase_item: prop<PurchaseItem[]>(),
}) {
  get asJson() {
    return {
      id: this.id,
      supplier_name: this.supplier_name,
      to_print: this.to_print,
      status: this.status,
      datetime_opened: this.datetime_opened,
      datetime_closed: this.datetime_closed,
      is_active: this.is_active,
      user_adder: this.user_adder,
      user_closer: this.user_closer,
      purchase_item: this.purchase_item,
    };
  }

  update(details: PurchaseInterface) {
    this.id = details.id ?? this.id;
    this.supplier_name = details.supplier_name ?? this.supplier_name;
    this.to_print = details.to_print ?? this.to_print;
    this.status = details.status ?? this.status;
    this.datetime_opened = details.datetime_opened ?? this.datetime_opened;
    this.datetime_closed = details.datetime_closed ?? this.datetime_closed;
    this.is_active = details.is_active ?? this.is_active;
    this.user_adder = details.user_adder ?? this.user_adder;
    this.user_closer = details.user_closer ?? this.user_closer;
    this.purchase_item = details.purchase_item ?? this.purchase_item;

    return this;
  }

  updateParticularPurchase(
    details: {
      quantity?: number;
      is_valid?: boolean;
      datetime_claimed?: string;
      user_giver?: string;
      product?: number;
      description?: string;
      unit?: string;
      purchase_price?: number;
    },
    purchaseItemId: number
  ) {
    let purchaseItem = this.purchase_item.find((s) => s.id === purchaseItemId);
    if (purchaseItem) {
      purchaseItem.quantity = details.quantity ?? purchaseItem.quantity;
      purchaseItem.is_valid = details.is_valid ?? purchaseItem.is_valid;
      purchaseItem.datetime_claimed =
        details.datetime_claimed ?? purchaseItem.datetime_claimed;
      purchaseItem.user_giver = details.user_giver ?? purchaseItem.user_giver;
      purchaseItem.product = details.product ?? purchaseItem.product;
      purchaseItem.description =
        details.description ?? purchaseItem.description;
      purchaseItem.unit = details.unit ?? purchaseItem.unit;
      purchaseItem.purchase_price =
        details.purchase_price ?? purchaseItem.purchase_price;
    }
    return this;
  }

  addParticularPurchase(details: PurchaseItem) {
    this.purchase_item.push(details);
    return this;
  }

  deleteParticularPurchase(purchaseItemId: number) {
    this.purchase_item.splice(
      this.purchase_item.findIndex((s) => s.id === purchaseItemId),
      1
    );
    return this;
  }
}

@model("myApp/PurchaseStore")
export class PurchaseStore extends Model({
  purchases: prop<Purchase[]>(() => []),
}) {
  get allIDs() {
    return this.purchases.map((s) => s.id);
  }

  @modelAction
  getItem(id: number) {
    return this.purchases.find((s) => s.id === id);
  }

  @modelFlow
  fetchAll = _async(function* (
    this: PurchaseStore,
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
      fetch(`${process.env["BASE_URL"]}/purchases2/${query}`, {
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

    let json: Purchase[];
    try {
      const resp = yield* _await(response.json());
      json = resp;
    } catch (error) {
      console.error("Parsing Error", error);
      return { details: "Parsing Error", ok: false, data: null };
    }

    json.forEach((s) => {
      if (!this.allIDs.includes(s.id ?? -1)) {
        this.purchases.push(new Purchase(s));
      } else {
        this.purchases
          .find((t) => t.id === s.id ?? -1)
          ?.update({
            id: s.id,
            status: s.status,
            to_print: s.to_print,
            supplier_name: s.supplier_name,
            datetime_opened: s.datetime_opened,
            datetime_closed: s.datetime_closed,
            is_active: s.is_active,
            user_adder: s.user_adder,
            user_closer: s.user_closer,
            purchase_item: s.purchase_item,
          });
      }
    });

    return { details: "", ok: true, data: json };
  });

  @modelFlow
  fetchOne = _async(function* (this: PurchaseStore, id: number) {
    let token: string;

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    let response: Response;

    response = yield* _await(
      fetch(`${process.env["BASE_URL"]}/purchases2/${id}/`, {
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

    let json: Purchase;
    try {
      const resp = yield* _await(response.json());
      json = resp;
    } catch (error) {
      console.error("Parsing Error", error);
      return { details: "Parsing Error", ok: false, data: null };
    }

    if (!this.allIDs.includes(id ?? -1)) {
      this.purchases.push(new Purchase(json));
    } else {
      this.purchases
        .find((t) => t.id === id ?? -1)
        ?.update({
          id: json.id,
          status: json.status,
          to_print: json.to_print,
          supplier_name: json.supplier_name,
          datetime_opened: json.datetime_opened,
          datetime_closed: json.datetime_closed,
          is_active: json.is_active,
          user_adder: json.user_adder,
          user_closer: json.user_closer,
          purchase_item: json.purchase_item,
        });
    }

    return { details: "", ok: true, data: json };
  });
  @modelFlow
  addItem = _async(function* (this: PurchaseStore, supplierName: string) {
    const user = JSON.parse(
      (yield* _await(AsyncStorage.getItem("@currentUser"))) ?? ""
    );

    let token: string;

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    const details = {
      user_adder: user?.user_id,
      supplier_name: supplierName,
    };

    let response: Response;

    response = yield* _await(
      fetch(`${process.env["BASE_URL"]}/purchases2/`, {
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

    let json: Purchase;
    try {
      const resp = yield* _await(response.json());
      json = resp;
    } catch (error) {
      console.error("Parsing Error", error);
      return { details: "Parsing Error", ok: false, data: null };
    }

    let purchase: Purchase;

    purchase = new Purchase(json);

    this.purchases.push(purchase);

    return { details: "", ok: true, data: purchase };
  });

  @modelFlow
  updateItem = _async(function* (
    this: PurchaseStore,
    purchaseId: number,
    details: {
      status?: string;
      supplier_name?: string;
      datetime_closed?: string;
      is_active?: boolean;
      user_validator?: string;
      user_closer?: string;
      to_print?: boolean;
    }
  ) {
    this.purchases
      .find((s) => purchaseId === s.id ?? -1)
      ?.update({
        status: details.status,
        supplier_name: details.supplier_name,
        datetime_closed: details.datetime_closed,
        is_active: details.is_active,
        user_closer: details.user_closer,
        to_print: details.to_print,
      });

    let token: string;

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    let response: Response;

    response = yield* _await(
      fetch(`${process.env["BASE_URL"]}/purchases2/${purchaseId}/`, {
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

    let json: Purchase;
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
  deleteItem = _async(function* (this: PurchaseStore, purchaseId: number) {
    let token: string;

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    let response: Response;

    response = yield* _await(
      fetch(`${process.env["BASE_URL"]}/purchases2/${purchaseId}/`, {
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

    const indexOfItem = this.purchases.findIndex((s) => s.id === purchaseId);

    this.purchases.splice(indexOfItem, 1);

    return { details: "", ok: true, data: null };
  });

  @modelFlow
  addItemParticularPurchase = _async(function* (
    this: PurchaseStore,
    details: {
      description: string;
      unit: string;
      purchase_price: number;
      product: number;
      purchase: number;
      quantity: number;
    }
  ) {
    let token: string;

    const user = JSON.parse(
      (yield* _await(AsyncStorage.getItem("@currentUser"))) ?? ""
    );

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    let response: Response;

    response = yield* _await(
      fetch(`${process.env["BASE_URL"]}/purchase_items/`, {
        method: "POST",
        body: JSON.stringify({ ...details, user_adder: user?.user_id }),
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

    let json: PurchaseItem;
    try {
      const resp = yield* _await(response.json());
      json = resp;
    } catch (error) {
      console.error("Parsing Error", error);
      return { details: "Parsing Error", ok: false, data: null };
    }

    let purchase = this.purchases.find((s) => s.id === details.purchase);

    if (purchase) {
      purchase.addParticularPurchase(json);
    }

    return { details: "", ok: true, data: json };
  });

  @modelFlow
  updateItemParticularPurchase = _async(function* (
    this: PurchaseStore,
    details: {
      quantity?: number;
      is_valid?: boolean;
      datetime_claimed?: string;
      user_giver?: string;
      product?: number;
      description?: string;
      unit?: string;
      purchase_price?: number;
    },
    purchaseId: number,
    purchaseItemId: number
  ) {
    let purchase = this.purchases.find((s) => s.id === purchaseId);

    if (purchase) {
      purchase.updateParticularPurchase(details, purchaseItemId);
    }

    let token: string;

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    let response: Response;

    response = yield* _await(
      fetch(`${process.env["BASE_URL"]}/purchase_items/${purchaseItemId}/`, {
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

    let json: PurchaseItem;
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
  deleteItemParticularPurchase = _async(function* (
    this: PurchaseStore,
    purchaseId: number,
    purchaseItemId: number
  ) {
    let purchase = this.purchases.find((s) => s.id === purchaseId);

    if (purchase) {
      purchase.deleteParticularPurchase(purchaseItemId);
    }
    let token: string;

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    let response: Response;

    response = yield* _await(
      fetch(`${process.env["BASE_URL"]}/purchase_items/${purchaseItemId}/`, {
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

    return { details: "", ok: true, data: null };
  });
}

export const purchaseStore = new PurchaseStore({});
