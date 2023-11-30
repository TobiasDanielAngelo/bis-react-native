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

@model("myApp/Mechanic")
export class Mechanic extends Model({
  id: prop<number>(-1),
  name: prop<string>(""),
  color: prop<string>(""),
  is_active: prop<boolean>(true),
}) {}

@model("myApp/MechanicStore")
export class MechanicStore extends Model({
  mechanics: prop<Mechanic[]>(() => []),
}) {
  get allIDs() {
    return this.mechanics.map((s) => s.id);
  }

  @modelAction
  getItem(id?: number) {
    if (!id) return;
    return this.mechanics.find((s) => s.id === id);
  }

  @modelFlow
  fetchAll = _async(function* (
    this: MechanicStore,
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
      fetch(`${process.env["BASE_URL"]}/mechanics/${query}`, {
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

    let json: Mechanic[];
    try {
      const resp = yield* _await(response.json());
      json = resp;
    } catch (error) {
      console.error("Parsing Error", error);
      return { details: "Parsing Error", ok: false, data: null };
    }

    json.forEach((s) => {
      if (!this.allIDs.includes(s.id)) {
        this.mechanics.push(new Mechanic(s));
      }
    });

    return { details: "", ok: true, data: json };
  });
  @modelFlow
  addItem = _async(function* (
    this: MechanicStore,
    details: {
      name: string;
    }
  ) {
    let token: string;

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    let response: Response;

    response = yield* _await(
      fetch(`${process.env["BASE_URL"]}/mechanics/`, {
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

    let json: Mechanic;
    try {
      const resp = yield* _await(response.json());
      json = resp;
    } catch (error) {
      console.error("Parsing Error", error);
      return { details: "Parsing Error", ok: false, data: null };
    }

    let mechanic: Mechanic;

    mechanic = new Mechanic(json);

    this.mechanics.push(mechanic);

    return { details: "", ok: true, data: mechanic };
  });
}

export const mechanicStore = new MechanicStore({});
