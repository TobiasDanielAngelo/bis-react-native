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

export interface ReturnedItemInterface {
  id?: number;
  quantity?: number;
  description?: string;
  unit?: string;
  selling_price?: number;
  datetime_added?: string;
  sales?: number;
  product?: number;
  user?: string;
}

@model("myApp/ReturnedItem")
export class ReturnedItem extends Model({
  id: prop<number>(-1),
  quantity: prop<number>(0),
  description: prop<string>(""),
  unit: prop<string>(""),
  selling_price: prop<number>(0),
  datetime_added: prop<string>(""),
  sales: prop<number>(-1),
  product: prop<number>(-1),
  user: prop<string>(""),
}) {
  update(details: ReturnedItemInterface) {
    Object.assign(this, details);
  }
}

@model("myApp/ReturnedItemStore")
export class ReturnedItemStore extends Model({
  returnedItems: prop<ReturnedItem[]>(() => []),
}) {
  get allIDs() {
    return this.returnedItems.map((s) => s.id);
  }

  @modelAction
  getItem(id?: number) {
    if (!id) return;
    return this.returnedItems.find((s) => s.id === id);
  }

  @modelFlow
  fetchAnalytics = _async(function* (
    this: ReturnedItemStore,
    filters: {
      range: string;
    }
  ) {
    let url: string;

    url = (yield* _await(AsyncStorage.getItem("@apiUrl"))) ?? "";

    let token: string;

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    let response: Response;

    response = yield* _await(
      fetch(`${url}/returned_items/?analytics=1&range=${filters.range}`, {
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

    let json: {
      returned_sales_from_goods: number;
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

export const returnedItemStore = new ReturnedItemStore({});
