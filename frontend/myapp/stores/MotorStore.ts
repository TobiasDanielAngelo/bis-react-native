import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  model,
  Model,
  modelFlow,
  prop,
  _async,
  _await,
  modelAction,
} from "mobx-keystone";
import { MotorInterface } from "../constants/interfaces";

@model("myApp/Motor")
export class Motor extends Model({
  id: prop<number>(),
  name: prop<string>(""),
  maker: prop<string>(""),
}) {
  get asJson() {
    return {
      id: this.id,
      name: this.name,
      maker: this.maker,
    };
  }
}

@model("myApp/MotorStore")
export class MotorStore extends Model({
  motors: prop<Motor[]>(() => []),
}) {
  get showMotors() {
    return this.motors.map((s) => s.asJson);
  }

  get allIDs() {
    return this.motors.map((s) => s.id);
  }

  @modelAction
  motorName(id: number) {
    return this.motors.find((s) => s.id === id)?.name;
  }

  @modelAction
  motorId(name: string) {
    return this.motors.find((s) => s.name === name)?.id;
  }

  @modelAction
  deleteMotorHistory() {
    this.motors.splice(0, this.motors.length);
  }

  @modelFlow
  fetchMotors = _async(function* (this: MotorStore) {
    let token: string;

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    let response: Response;

    response = yield* _await(
      fetch(`${process.env["BASE_URL"]}/motors/`, {
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

    let json: MotorInterface[];
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
}

export const motorStore = new MotorStore({});
