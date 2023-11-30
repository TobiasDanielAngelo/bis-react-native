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

@model("myApp/Motor")
export class Motor extends Model({
  id: prop<number>(-1),
  name: prop<string>(""),
  maker: prop<string>(""),
}) {}

@model("myApp/MotorStore")
export class MotorStore extends Model({
  motors: prop<Motor[]>(() => []),
}) {
  get allIDs() {
    return this.motors.map((s) => s.id);
  }

  @modelAction
  getItem(id?: number) {
    if (!id) return;
    return this.motors.find((s) => s.id === id);
  }

  @modelAction
  motorName(id: number) {
    return this.motors.find((s) => s.id === id)?.name;
  }

  @modelAction
  motorId(name: string) {
    return this.motors.find((s) => s.name === name)?.id;
  }

  @modelFlow
  fetchAll = _async(function* (
    this: MotorStore,
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
      fetch(`http://192.168.254.197:8000/motors/${query}`, {
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

    let json: Motor[];
    try {
      const resp = yield* _await(response.json());
      json = resp;
    } catch (error) {
      console.error("Parsing Error", error);
      return { details: "Parsing Error", ok: false, data: null };
    }

    json.forEach((s) => {
      if (!this.allIDs.includes(s.id)) {
        this.motors.push(new Motor(s));
      }
    });

    return { details: "", ok: true, data: json };
  });

  @modelFlow
  addItem = _async(function* (
    this: MotorStore,
    details: {
      name: string;
      maker: string;
    }
  ) {
    let token: string;

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    let response: Response;

    response = yield* _await(
      fetch(`http://192.168.254.197:8000/motors/`, {
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

    let json: Motor;
    try {
      const resp = yield* _await(response.json());
      json = resp;
    } catch (error) {
      console.error("Parsing Error", error);
      return { details: "Parsing Error", ok: false, data: null };
    }

    let motor: Motor;

    motor = new Motor(json);

    this.motors.push(motor);

    return { details: "", ok: true, data: motor };
  });
}

export const motorStore = new MotorStore({});
