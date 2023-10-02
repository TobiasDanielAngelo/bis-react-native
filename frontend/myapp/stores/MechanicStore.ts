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
import { MechanicInterface } from "../constants/interfaces";

@model("myApp/Mechanic")
export class Mechanic extends Model({
  id: prop<number>(),
  name: prop<string>(""),
  color: prop<string>(""),
}) {
  get asJson() {
    return {
      id: this.id,
      name: this.name,
      color: this.color,
    };
  }
}

@model("myApp/MechanicStore")
export class MechanicStore extends Model({
  mechanics: prop<Mechanic[]>(() => []),
}) {
  get allIDs() {
    return this.mechanics.map((s) => s.id);
  }

  @modelAction
  mechanicName(id: number) {
    return this.mechanics.find((s) => s.id === id)?.name;
  }

  @modelAction
  mechanicId(name: string) {
    return this.mechanics.find((s) => s.name === name)?.id;
  }

  @modelFlow
  fetchMechanics = _async(function* (this: MechanicStore) {
    let token: string;

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    let response: Response;

    response = yield* _await(
      fetch(`${process.env["BASE_URL"]}/mechanics/`, {
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

    let json: MechanicInterface[];
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
}

export const mechanicStore = new MechanicStore({});
