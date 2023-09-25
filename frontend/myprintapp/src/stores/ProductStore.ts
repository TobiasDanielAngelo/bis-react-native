import {
  model,
  Model,
  modelFlow,
  prop,
  _async,
  _await,
  modelAction,
} from "mobx-keystone";

export interface ProductInterface {
  pk: string;
  unit: string;
  description: string;
  datetime_added: string;
  sell_price: number;
  location: string;
  is_active: boolean;
}

@model("myApp/Product")
export class Product extends Model({
  pk: prop<string>(""),
  unit: prop<string>(""),
  description: prop<string>(""),
  min_quantity: prop<number>(0),
  location: prop<string>(""),
  sell_price: prop<number>(0),
  datetime_added: prop<string>(""),
  is_active: prop<boolean>(true),
}) {
  get asJson() {
    return {
      pk: this.pk,
      unit: this.unit,
      description: this.description,
      min_quantity: this.min_quantity,
      location: this.location,
      sell_price: this.sell_price,
      datetime_added: this.datetime_added,
      is_active: this.is_active,
    };
  }
}

@model("myApp/ProductStore")
export class ProductStore extends Model({
  products: prop<Product[]>(() => []),
}) {
  get showProducts() {
    return this.products.map((s) => s.asJson);
  }

  get allPK() {
    return this.products.map((s) => s.pk);
  }

  @modelAction
  productName(pk: string) {
    return this.products.find((s) => `${s.pk}` === `${pk}`)?.description;
  }

  @modelAction
  productPrice(pk: string) {
    return this.products.find((s) => `${s.pk}` === `${pk}`)?.sell_price;
  }

  @modelFlow
  fetchProducts = _async(function* (this: ProductStore) {
    let token: string;

    token = localStorage.getItem("@userToken") ?? "";

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
      if (!this.allPK.includes(s.pk)) {
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

    token = localStorage.getItem("@userToken") ?? "";

    let response: Response;

    response = yield* _await(
      fetch(`${process.env["BASE_URL"]}/products`, {
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
      json = resp.Product;
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
