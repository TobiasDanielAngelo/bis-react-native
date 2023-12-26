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

@model("myApp/CountItem")
export class CountItem extends Model({
  id: prop<number>(-1),
  quantity: prop<number>(0),
  is_pending: prop<boolean>(false),
  datetime_counted: prop<string>(""),
  product: prop<number>(-1),
  user_counter: prop<string>(""),
}) {}

@model("myApp/CountItemStore")
export class CountItemStore extends Model({
  countItems: prop<CountItem[]>(() => []),
}) {
  @modelAction
  getItem(id?: number) {
    if (!id) return;
    return this.countItems.find((s) => s.id === id);
  }

  @modelFlow
  addItem = _async(function* (
    this: CountItemStore,
    countDetails: { product: number; quantity: number }
  ) {
    const user = JSON.parse(
      (yield* _await(AsyncStorage.getItem("@currentUser"))) ?? ""
    );
    let url: string;

    url = (yield* _await(AsyncStorage.getItem("@apiUrl"))) ?? "";

    let token: string;

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    const details = {
      user_counter: user?.user_id,
      ...countDetails,
    };

    let response: Response;

    response = yield* _await(
      fetch(`${url}/count_items/`, {
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

    let json: CountItem;
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
  fetchAnalytics = _async(function* (
    this: CountItemStore,
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
      fetch(`${url}/count_items/?analytics=1&range=${filters.range}`, {
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
      lost_gained_goods: number;
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

export const countItemStore = new CountItemStore({});
