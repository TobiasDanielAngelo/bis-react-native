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

export interface PurchaseItemInterface {
  id?: number;
  purchase?: number;
  product?: number;
  description?: string;
  unit?: string;
  quantity?: number;
  is_valid?: boolean;
  purchase_price?: number;
  user_adder?: string;
  user_giver?: string;
  datetime_added?: string;
  datetime_claimed?: string;
}

@model("myApp/PurchaseItem")
export class PurchaseItem extends Model({
  id: prop<number>(-1),
  purchase: prop<number>(-1),
  product: prop<number>(-1),
  description: prop<string>(""),
  unit: prop<string>(""),
  quantity: prop<number>(0),
  is_valid: prop<boolean>(false),
  purchase_price: prop<number>(0),
  user_adder: prop<string>(""),
  user_giver: prop<string>(""),
  datetime_added: prop<string>(""),
  datetime_claimed: prop<string>(""),
}) {
  update(details: PurchaseItemInterface) {
    Object.assign(this, details);
  }
}

@model("myApp/PurchaseItemStore")
export class PurchaseItemStore extends Model({
  purchaseItems: prop<PurchaseItem[]>(() => []),
}) {
  get allIDs() {
    return this.purchaseItems.map((s) => s.id);
  }

  @modelAction
  getItem(id?: number) {
    if (!id) return;
    return this.purchaseItems.find((s) => s.id === id);
  }

  @modelFlow
  fetchAnalytics = _async(function* (
    this: PurchaseItemStore,
    filters: {
      range: string;
    }
  ) {
    let token: string;

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    let response: Response;

    response = yield* _await(
      fetch(
        `http://192.168.254.197:8000/purchase_items/?analytics=1&range=${filters.range}`,
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
      total_purchased_goods_cost: number;
      total_purchased_goods_worth: number;
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
}

export const purchaseItemStore = new PurchaseItemStore({});
