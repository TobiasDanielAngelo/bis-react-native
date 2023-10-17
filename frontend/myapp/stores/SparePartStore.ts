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
import { SparePartInterface } from "../constants/interfaces";

@model("myApp/SparePart")
export class SparePart extends Model({
  id: prop<number>(),
  name: prop<string>(""),
  is_motor_shown: prop<boolean>(true),
  is_semi_shown: prop<boolean>(false),
}) {
  get asJson() {
    return {
      id: this.id,
      name: this.name,
      is_motor_shown: this.is_motor_shown,
      is_semi_shown: this.is_semi_shown,
    };
  }
}

@model("myApp/SparePartStore")
export class SparePartStore extends Model({
  spareParts: prop<SparePart[]>(() => []),
}) {
  @modelAction
  deletePartsHistory() {
    this.spareParts.splice(0, this.spareParts.length);
  }

  get allIDs() {
    return this.spareParts.map((s) => s.id);
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
  fetchSpareParts = _async(function* (this: SparePartStore) {
    let token: string;

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    let response: Response;

    response = yield* _await(
      fetch(`${process.env["BASE_URL"]}/spareparts/`, {
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

    let json: SparePartInterface[];
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
