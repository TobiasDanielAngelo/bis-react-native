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

export interface LaborItemInterface {
  id?: number;
  labor_name?: string;
  is_done?: boolean;
  amount_received?: number;
  amount_returned?: number;
  amount_owed?: number;
  datetime_added?: string;
  datetime_done?: string;
  sales?: number;
  mechanic?: number;
  user_adder?: string;
  user_giver?: string;
}

@model("myApp/LaborItem")
export class LaborItem extends Model({
  id: prop<number>(-1),
  labor_name: prop<string>(""),
  is_done: prop<boolean>(false),
  amount_received: prop<number>(0),
  amount_returned: prop<number>(0),
  amount_owed: prop<number>(0),
  datetime_added: prop<string>(""),
  datetime_done: prop<string>(""),
  sales: prop<number>(-1),
  mechanic: prop<number>(-1),
  user_adder: prop<string>(""),
  user_giver: prop<string>(""),
}) {
  update(details: LaborItemInterface) {
    Object.assign(this, details);
    return this;
  }
}

@model("myApp/LaborItemStore")
export class LaborItemStore extends Model({
  laborItems: prop<LaborItem[]>(() => []),
}) {
  get allIDs() {
    return this.laborItems.map((s) => s.id);
  }

  @modelAction
  getItem(id?: number) {
    if (!id) return;
    return this.laborItems.find((s) => s.id === id);
  }

  @modelFlow
  fetchAnalytics = _async(function* (
    this: LaborItemStore,
    filters: {
      range: string;
    }
  ) {
    let token: string;

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    let response: Response;

    response = yield* _await(
      fetch(
        `${process.env["BASE_URL"]}/labor_items/?analytics=1&range=${filters.range}`,
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
      owed_labor: number;
      receive_labor_paid: number;
      receive_labor_unpaid: number;
      receive_labor_validating: number;
      returned_labor: number;
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

export const laborItemStore = new LaborItemStore({});
