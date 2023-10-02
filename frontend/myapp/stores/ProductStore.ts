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
import { ProductInterface } from "../constants/interfaces";

@model("myApp/Product")
export class Product extends Model({
  id: prop<string>(""),
  piece_count: prop<number>(0),
  unit: prop<string>(""),
  description: prop<string>(""),
  brand: prop<string>(""),
  part: prop<string>(""),
  motors: prop<string>(""),
  generic: prop<string>(""),
  datetime_added: prop<string>(""),
  is_active: prop<boolean>(true),
  location: prop<string>(""),
  purchase_price: prop<number>(0),
  sell_price: prop<number>(0),
  min_quantity: prop<number>(0),
}) {
  get asJson() {
    return {
      id: this.id,
      piece_count: this.piece_count,
      unit: this.unit,
      description: this.description,
      brand: this.brand,
      part: this.part,
      motors: this.motors,
      generic: this.generic,
      datetime_added: this.datetime_added,
      is_active: this.is_active,
      location: this.location,
      purchase_price: this.purchase_price,
      sell_price: this.sell_price,
      min_quantity: this.min_quantity,
    };
  }
}

@model("myApp/ProductStore")
export class ProductStore extends Model({
  products: prop<Product[]>(() => []),
}) {
  get allPK() {
    return this.products.map((s) => s.id);
  }

  @modelAction
  deleteProductHistory() {
    this.products.splice(0, this.products.length);
  }

  @modelFlow
  fetchProductByQuery = _async(function* (this: ProductStore, query: string) {
    let token: string;

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    let response: Response;

    response = yield* _await(
      fetch(`${process.env["BASE_URL"]}/products/?q=${query}`, {
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

    let json: ProductInterface[];
    try {
      const resp = yield* _await(response.json());
      json = resp;
    } catch (error) {
      console.error("Parsing Error", error);
      return { details: "Parsing Error", ok: false, data: null };
    }

    json.forEach((s) => {
      if (!this.allPK.includes(s.id ?? "-1")) {
        this.products.push(new Product(s));
      }
    });

    return { details: "", ok: true, data: json };
  });

  @modelFlow
  fetchProductByProps = _async(function* (
    this: ProductStore,
    brand: string,
    part: number,
    motors: number[],
    description: string
  ) {
    let token: string;

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    let response: Response;

    response = yield* _await(
      fetch(
        `${
          process.env["BASE_URL"]
        }/products/?brand=${brand}&part=${part}&motors=${motors.join(
          "+"
        )}&description=${description}`,
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

    let json: ProductInterface[];
    try {
      const resp = yield* _await(response.json());
      json = resp;
    } catch (error) {
      console.error("Parsing Error", error);
      return { details: "Parsing Error", ok: false, data: null };
    }

    json.forEach((s) => {
      if (!this.allPK.includes(s.id ?? "-1")) {
        this.products.push(new Product(s));
      }
    });

    return { details: "", ok: true, data: json };
  });

  @modelFlow
  fetchProducts = _async(function* (this: ProductStore) {
    let token: string;

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    let response: Response;

    response = yield* _await(
      fetch(`${process.env["BASE_URL"]}/products/`, {
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

    let json: ProductInterface[];
    try {
      const resp = yield* _await(response.json());
      json = resp;
    } catch (error) {
      console.error("Parsing Error", error);
      return { details: "Parsing Error", ok: false, data: null };
    }

    json.forEach((s) => {
      if (!this.allPK.includes(s.id ?? "-1")) {
        this.products.push(new Product(s));
      }
    });

    return { details: "", ok: true, data: json };
  });

  @modelFlow
  addProduct = _async(function* (
    this: ProductStore,
    details: ProductInterface
  ) {
    let token: string;

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    let response: Response;

    response = yield* _await(
      fetch(`${process.env["BASE_URL"]}/products/`, {
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

    let json: ProductInterface;
    try {
      const resp = yield* _await(response.json());
      json = resp;
    } catch (error) {
      console.error("Parsing Error", error);
      return { details: "Parsing Error", ok: false, data: null };
    }

    let product: Product;

    product = new Product(json);

    this.products.push(product);

    return { details: "", ok: true, data: product };
  });
}

export const productStore = new ProductStore({});
