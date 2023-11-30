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

@model("myApp/SparePart")
export class SparePart extends Model({
  id: prop<number>(-1),
  name: prop<string>(""),
  is_motor_shown: prop<boolean>(true),
  is_semi_shown: prop<boolean>(false),
}) {}

@model("myApp/SparePartStore")
export class SparePartStore extends Model({
  spareParts: prop<SparePart[]>(() => []),
}) {
  get allIDs() {
    return this.spareParts.map((s) => s.id);
  }

  @modelAction
  getItem(id?: number) {
    if (!id) return;
    return this.spareParts.find((s) => s.id === id);
  }

  @modelAction
  sparePartName(id: number) {
    return this.spareParts.find((s) => s.id === id)?.name ?? "";
  }

  @modelAction
  sparePartId(name: string) {
    return this.spareParts.find((s) => s.name === name)?.id ?? -1;
  }

  @modelFlow
  fetchAll = _async(function* (
    this: SparePartStore,
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
      fetch(`http://192.168.254.197:8000/spareparts/${query}`, {
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

    let json: SparePart[];
    try {
      const resp = yield* _await(response.json());
      json = resp;
    } catch (error) {
      console.error("Parsing Error", error);
      return { details: "Parsing Error", ok: false, data: null };
    }

    json.forEach((s) => {
      if (!this.allIDs.includes(s.id)) {
        this.spareParts.push(new SparePart(s));
      }
    });

    return { details: "", ok: true, data: json };
  });
}

export const sparePartStore = new SparePartStore({});
