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
    Object.assign(this, details);
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
  fetchAnalytics = _async(function* (
    this: SalesItemStore,
    filters: {
      range: string;
    }
  ) {
    let token: string;

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    let response: Response;

    response = yield* _await(
      fetch(
        `${process.env["BASE_URL"]}/sales_items/?analytics=1&range=${filters.range}`,
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
      gross_sales_from_goods_paid: number;
      gross_sales_from_goods_unpaid: number;
      gross_sales_from_goods_validating: number;
      sales_profit_from_goods_paid: number;
      sales_profit_from_goods_unpaid: number;
      sales_profit_from_goods_validating: number;
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
