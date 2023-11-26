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

export interface ProductInterface {
  id?: string;
  piece_count: number;
  unit: string;
  description: string;
  brand: string;
  part: string;
  motors: string;
  datetime_added: string;
  datetime_updated: string;
  is_active: boolean;
  location: string;
  purchase_price: number;
  sell_price: number;
  min_quantity: number;
  is_orig: boolean;
  print_count: number;
}

export interface ProductUpdateInterface {
  piece_count?: number;
  unit?: string;
  description?: string;
  brand?: string;
  part?: string;
  motors?: string;
  datetime_added?: string;
  is_active?: boolean;
  location?: string;
  purchase_price?: number;
  sell_price?: number;
  min_quantity?: number;
  is_orig?: boolean;
  print_count?: number;
  datetime_updated?: string;
  sold?: number;
  returned?: number;
  purchased?: number;
  counted?: number;
}

@model("myApp/Product")
export class Product extends Model({
  id: prop<number>(-1),
  piece_count: prop<number>(0),
  unit: prop<string>(""),
  description: prop<string>(""),
  brand: prop<string>(""),
  part: prop<string>(""),
  motors: prop<string>(""),
  datetime_added: prop<string>(""),
  is_active: prop<boolean>(true),
  location: prop<string>(""),
  purchase_price: prop<number>(0),
  sell_price: prop<number>(0),
  min_quantity: prop<number>(0),
  is_orig: prop<boolean>(false),
  print_count: prop<number>(0),
  datetime_updated: prop<string>(""),
  sold: prop<number>(0),
  purchased: prop<number>(0),
  returned: prop<number>(0),
  counted: prop<number>(0),
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
      datetime_added: this.datetime_added,
      is_active: this.is_active,
      location: this.location,
      purchase_price: this.purchase_price,
      sell_price: this.sell_price,
      min_quantity: this.min_quantity,
      is_orig: this.is_orig,
      print_count: this.print_count,
      datetime_updated: this.datetime_updated,
      sold: this.sold,
      returned: this.returned,
      purchased: this.purchased,
      counted: this.counted,
    };
  }

  update(details: ProductUpdateInterface) {
    this.piece_count = details.piece_count ?? this.piece_count;
    this.unit = details.unit ?? this.unit;
    this.description = details.description ?? this.description;
    this.brand = details.brand ?? this.brand;
    this.part = details.part ?? this.part;
    this.motors = details.motors ?? this.motors;
    this.datetime_added = details.datetime_added ?? this.datetime_added;
    this.is_active = details.is_active ?? this.is_active;
    this.location = details.location ?? this.location;
    this.purchase_price = details.purchase_price ?? this.purchase_price;
    this.sell_price = details.sell_price ?? this.sell_price;
    this.min_quantity = details.min_quantity ?? this.min_quantity;
    this.is_orig = details.is_orig ?? this.is_orig;
    this.print_count = details.print_count ?? this.print_count;
    this.datetime_updated = details.datetime_updated ?? this.datetime_updated;
    this.sold = details.sold ?? this.sold;
    this.returned = details.returned ?? this.returned;
    this.purchased = details.purchased ?? this.purchased;
    this.counted = details.counted ?? this.counted;
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
  getItem(id: number) {
    return this.products.find((s) => s.id === id);
  }

  @modelFlow
  fetchProductRangeIds = _async(function* (this: ProductStore) {
    let token: string;

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    let response: Response;

    response = yield* _await(
      fetch(`${process.env["BASE_URL"]}/products/?get_id_range=1`, {
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

    let json: { max_id: number; min_id: number };
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
  fetchProductsByIds = _async(function* (this: ProductStore, ids: number[]) {
    if (ids.length === 0) return;
    let token: string;

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    let response: Response;

    response = yield* _await(
      fetch(`${process.env["BASE_URL"]}/products/?incl=${ids.join("+")}`, {
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

    let json: Product[];
    try {
      const resp = yield* _await(response.json());
      json = resp;
    } catch (error) {
      console.error("Parsing Error", error);
      return { details: "Parsing Error", ok: false, data: null };
    }

    json.forEach((s) => {
      if (!this.allPK.includes(s.id ?? -1)) {
        this.products.push(new Product(s));
      }
    });

    return { details: "", ok: true, data: json };
  });

  @modelFlow
  fetchProduct = _async(function* (this: ProductStore, productId: number) {
    let token: string;

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    let response: Response;

    response = yield* _await(
      fetch(`${process.env["BASE_URL"]}/products/${productId}/`, {
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

    let json: Product;
    try {
      const resp = yield* _await(response.json());
      json = resp;
    } catch (error) {
      console.error("Parsing Error", error);
      return { details: "Parsing Error", ok: false, data: null };
    }

    if (!this.allPK.includes(json.id ?? -1)) {
      this.products.push(new Product(json));
    } else {
      json.counted = json.counted ?? 0;
      json.returned = json.returned ?? 0;
      json.sold = json.sold ?? 0;
      json.purchased = json.purchased ?? 0;
      this.getItem(json.id)?.update(json);
    }

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

    let json: Product;
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

  @modelFlow
  updateProduct = _async(function* (
    this: ProductStore,
    id: number,
    details: ProductUpdateInterface
  ) {
    let product = this.getItem(id);

    if (!product)
      return { details: "Product not Found", ok: false, data: null };

    product.update(details);

    let token: string;

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    let response: Response;

    response = yield* _await(
      fetch(`${process.env["BASE_URL"]}/products/${id}/`, {
        method: "PATCH",
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

    let json: Product;
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

export const product2Store = new ProductStore({});
