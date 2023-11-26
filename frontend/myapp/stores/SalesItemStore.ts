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

export interface SaleItemInterface {
  id?: number;
  description?: string;
  unit?: string;
  quantity?: number;
  is_claimed?: boolean;
  selling_price?: number;
  datetime_added?: string;
  datetime_claimed?: string;
  sales?: number;
  product?: number;
  user_adder?: string;
  user_giver?: string;
}

@model("myApp/SalesItem")
export class SalesItem extends Model({
  id: prop<number>(-1),
  description: prop<string>(""),
  unit: prop<string>(""),
  quantity: prop<number>(0),
  is_claimed: prop<boolean>(false),
  selling_price: prop<number>(0),
  datetime_added: prop<string>(""),
  datetime_claimed: prop<string>(""),
  sales: prop<number>(-1),
  product: prop<number>(-1),
  user_adder: prop<string>(""),
  user_giver: prop<string>(""),
}) {
  update(details: SaleItemInterface) {
    this.id = details.id ?? this.id;
    this.description = details.description ?? this.description;
    this.unit = details.unit ?? this.unit;
    this.quantity = details.quantity ?? this.quantity;
    this.is_claimed = details.is_claimed ?? this.is_claimed;
    this.selling_price = details.selling_price ?? this.selling_price;
    this.datetime_added = details.datetime_added ?? this.datetime_added;
    this.datetime_claimed = details.datetime_claimed ?? this.datetime_claimed;
    this.sales = details.sales ?? this.sales;
    this.product = details.product ?? this.product;
    this.user_adder = details.user_adder ?? this.user_adder;
    this.user_giver = details.user_giver ?? this.user_giver;
    return this;
  }
}

@model("myApp/SaleItemStore")
export class SalesItemStore extends Model({
  salesItems: prop<SalesItem[]>(() => []),
}) {
  get allIDs() {
    return this.salesItems.map((s) => s.id);
  }

  @modelAction
  getItem(id?: number) {
    if (!id) return;
    return this.salesItems.find((s) => s.id === id);
  }

  @modelFlow
  fetchMany = _async(function* (
    this: SalesItemStore,
    filters?: {
      startDate?: string;
      endDate?: string;
      ids?: number[];
      product?: number;
      saleStatus?: string;
    }
  ) {
    let token: string;

    let queryFilters: string[] = [];
    let query: string = "";

    if (filters) {
      if (filters.startDate)
        queryFilters.push(`start_date=${filters.startDate}`);
      if (filters?.endDate) queryFilters.push(`end_date=${filters.endDate}`);
      if (filters?.ids) queryFilters.push(`ids=${filters.ids.join("+")}`);
      if (filters?.product) queryFilters.push(`product=${filters.product}`);
      if (filters?.saleStatus)
        queryFilters.push(`sale_status=${filters.saleStatus}`);
    }

    if (queryFilters.length > 0) {
      query = "?" + queryFilters.join("&");
    }

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    let response: Response;

    response = yield* _await(
      fetch(`${process.env["BASE_URL"]}/sales_items/${query}`, {
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

    let json: SalesItem[];
    try {
      const resp = yield* _await(response.json());
      json = resp;
    } catch (error) {
      console.error("Parsing Error", error);
      return { details: "Parsing Error", ok: false, data: null };
    }

    json.forEach((s) => {
      if (!this.allIDs.includes(s.id ?? -1)) {
        this.salesItems.push(new SalesItem(s));
      }
    });

    return { details: "", ok: true, data: json };
  });
}

export const salesItemStore = new SalesItemStore({});
