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
  piece_count?: number;
  unit?: string;
  description?: string;
  brand?: string;
  part?: number;
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
  part: prop<number>(-1),
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
  update(details: ProductInterface) {
    Object.assign(this, details);
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
  fetchProductRange = _async(function* (this: ProductStore) {
    let url: string;

    url = (yield* _await(AsyncStorage.getItem("@apiUrl"))) ?? "";

    let token: string;

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    let response: Response;

    response = yield* _await(
      fetch(`${url}/products/?get_id_range=1`, {
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
  fetchMatches = _async(function* (this: ProductStore, query: string) {
    let url: string;

    url = (yield* _await(AsyncStorage.getItem("@apiUrl"))) ?? "";

    let token: string;

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    let response: Response;

    response = yield* _await(
      fetch(`${url}/products/?q=${query}`, {
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

    let json: { ids: number[] };
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
  fetchProducts = _async(function* (
    this: ProductStore,
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

    let url: string;

    url = (yield* _await(AsyncStorage.getItem("@apiUrl"))) ?? "";

    let token: string;

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    let response: Response;

    response = yield* _await(
      fetch(`${url}/products/${query}`, {
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
      if (!this.allPK.includes(s.id)) {
        this.products.push(new Product(s));
      } else {
        this.getItem(s.id)?.update(s);
      }
    });

    return { details: "", ok: true, data: json };
  });

  @modelFlow
  fetchProduct = _async(function* (this: ProductStore, productId: number) {
    let url: string;

    url = (yield* _await(AsyncStorage.getItem("@apiUrl"))) ?? "";

    let token: string;

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    let response: Response;

    response = yield* _await(
      fetch(`${url}/products/${productId}/`, {
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

    if (!this.allPK.includes(json.id)) {
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
    let url: string;

    url = (yield* _await(AsyncStorage.getItem("@apiUrl"))) ?? "";

    let token: string;

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    let response: Response;

    response = yield* _await(
      fetch(`${url}/products/`, {
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
    details: ProductInterface
  ) {
    let product = this.getItem(id);

    if (!product)
      return { details: "Product not Found", ok: false, data: null };

    product.update(details);

    let url: string;

    url = (yield* _await(AsyncStorage.getItem("@apiUrl"))) ?? "";

    let token: string;

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    let response: Response;

    response = yield* _await(
      fetch(`${url}/products/${id}/`, {
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

export const productStore = new ProductStore({});
