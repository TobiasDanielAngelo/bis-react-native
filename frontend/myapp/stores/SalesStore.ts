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
import { LaborItem, LaborItemInterface } from "./LaborItemStore";
import { ReturnedItem, ReturnedItemInterface } from "./ReturnedItemStore";
import { SaleItemInterface, SalesItem } from "./SalesItemStore";

export interface SaleInterface {
  id?: number;
  to_print?: boolean;
  payment?: number[];
  status?: string;
  customer_name?: string;
  datetime_opened?: string;
  datetime_closed?: string;
  is_active?: boolean;
  discount?: number;
  user_adder?: string;
  user_validator?: string;
  user_closer?: string;
  sales_item?: SalesItem[];
  labor_item?: LaborItem[];
  returned_item?: ReturnedItem[];
}

@model("myApp/Sales")
export class Sale extends Model({
  id: prop<number>(-1),
  to_print: prop<boolean>(false),
  payment: prop<number[]>(),
  status: prop<string>(""),
  customer_name: prop<string>(""),
  datetime_opened: prop<string>(""),
  datetime_closed: prop<string>(""),
  is_active: prop<boolean>(true),
  discount: prop<number>(0),
  user_adder: prop<string>(""),
  user_validator: prop<string>(""),
  user_closer: prop<string>(""),
  sales_item: prop<SalesItem[]>(),
  labor_item: prop<LaborItem[]>(),
  returned_item: prop<ReturnedItem[]>(),
}) {
  update(details: SaleInterface) {
    Object.assign(this, details);
  }

  updateParticularSale(details: SaleItemInterface, salesItemId: number) {
    let salesItem = this.sales_item.find((s) => s.id === salesItemId);
    if (salesItem) {
      Object.assign(salesItem, details);
    }
  }

  updateParticularLabor(details: LaborItemInterface, laborItemId: number) {
    let laborItem = this.labor_item.find((s) => s.id === laborItemId);
    if (laborItem) {
      Object.assign(laborItem, details);
    }
  }

  addParticularSale(details: SalesItem) {
    this.sales_item.push(details);
  }

  addParticularLabor(details: LaborItem) {
    this.labor_item.push(details);
  }

  addParticularReturn(details: ReturnedItem) {
    this.returned_item.push(details);
  }

  deleteParticularSale(salesItemId: number) {
    this.sales_item.splice(
      this.sales_item.findIndex((s) => s.id === salesItemId),
      1
    );
  }

  deleteParticularLabor(laborItemId: number) {
    this.labor_item.splice(
      this.labor_item.findIndex((s) => s.id === laborItemId),
      1
    );
  }
}

@model("myApp/SaleStore")
export class SaleStore extends Model({
  sales: prop<Sale[]>(() => []),
}) {
  get allIDs() {
    return this.sales.map((s) => s.id);
  }

  @modelAction
  getItem(id: number) {
    return this.sales.find((s) => s.id === id);
  }

  @modelAction
  deleteAll() {
    this.sales.splice(0, this.sales.length);
  }

  @modelFlow
  fetchAnalytics = _async(function* (
    this: SaleStore,
    filters: {
      range: string;
    }
  ) {
    let url: string;

    url = (yield* _await(AsyncStorage.getItem("@apiUrl"))) ?? "";
    let token: string;

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    let response: Response;

    response = yield* _await(
      fetch(`${url}/sales/?analytics=1&range=${filters.range}`, {
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

    let json: {
      total_discount: number;
    };
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
  fetchAll = _async(function* (
    this: SaleStore,
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
      fetch(`${url}/sales/${query}`, {
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

    let json: Sale[];
    try {
      const resp = yield* _await(response.json());
      json = resp;
    } catch (error) {
      console.error("Parsing Error", error);
      return { details: "Parsing Error", ok: false, data: null };
    }

    json.forEach((s) => {
      if (!this.allIDs.includes(s.id ?? -1)) {
        this.sales.push(new Sale(s));
      } else {
        this.sales.find((t) => t.id === s.id ?? -1)?.update(s);
      }
    });

    return { details: "", ok: true, data: json };
  });

  @modelFlow
  fetchOne = _async(function* (this: SaleStore, id: number) {
    let url: string;

    url = (yield* _await(AsyncStorage.getItem("@apiUrl"))) ?? "";

    let token: string;

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    let response: Response;

    response = yield* _await(
      fetch(`${url}/sales/${id}/`, {
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

    let json: Sale;
    try {
      const resp = yield* _await(response.json());
      json = resp;
    } catch (error) {
      console.error("Parsing Error", error);
      return { details: "Parsing Error", ok: false, data: null };
    }

    if (!this.allIDs.includes(id ?? -1)) {
      this.sales.push(new Sale(json));
    } else {
      this.sales.find((t) => t.id === id ?? -1)?.update(json);
    }

    return { details: "", ok: true, data: json };
  });
  @modelFlow
  addItem = _async(function* (this: SaleStore, customerName: string) {
    const user = JSON.parse(
      (yield* _await(AsyncStorage.getItem("@currentUser"))) ?? ""
    );

    let url: string;

    url = (yield* _await(AsyncStorage.getItem("@apiUrl"))) ?? "";

    let token: string;

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    const details = {
      user_adder: user?.user_id,
      customer_name: customerName,
    };

    let response: Response;

    response = yield* _await(
      fetch(`${url}/sales/`, {
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

    let json: Sale;
    try {
      const resp = yield* _await(response.json());
      json = resp;
    } catch (error) {
      console.error("Parsing Error", error);
      return { details: "Parsing Error", ok: false, data: null };
    }

    let sale: Sale;

    sale = new Sale(json);

    this.sales.push(sale);

    return { details: "", ok: true, data: sale };
  });

  @modelFlow
  updateItem = _async(function* (
    this: SaleStore,
    saleId: number,
    details: SaleInterface
  ) {
    this.sales.find((s) => saleId === s.id ?? -1)?.update(details);

    let url: string;

    url = (yield* _await(AsyncStorage.getItem("@apiUrl"))) ?? "";

    let token: string;

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    let response: Response;

    response = yield* _await(
      fetch(`${url}/sales/${saleId}/`, {
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

    let json: Sale;
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
  addItemParticularSale = _async(function* (
    this: SaleStore,
    details: SaleItemInterface
  ) {
    let url: string;

    url = (yield* _await(AsyncStorage.getItem("@apiUrl"))) ?? "";

    let token: string;

    const user = JSON.parse(
      (yield* _await(AsyncStorage.getItem("@currentUser"))) ?? ""
    );

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    let response: Response;

    response = yield* _await(
      fetch(`${url}/sales_items/`, {
        method: "POST",
        body: JSON.stringify({ ...details, user_adder: user?.user_id }),
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

    let json: SalesItem;
    try {
      const resp = yield* _await(response.json());
      json = resp;
    } catch (error) {
      console.error("Parsing Error", error);
      return { details: "Parsing Error", ok: false, data: null };
    }

    let sale = this.sales.find((s) => s.id === details.sales);

    if (sale) {
      sale.addParticularSale(json);
    }

    return { details: "", ok: true, data: json };
  });

  @modelFlow
  addItemParticularLabor = _async(function* (
    this: SaleStore,
    details: LaborItemInterface
  ) {
    let url: string;

    url = (yield* _await(AsyncStorage.getItem("@apiUrl"))) ?? "";

    let token: string;

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    let response: Response;

    response = yield* _await(
      fetch(`${url}/labor_items/`, {
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

    let json: LaborItem;
    try {
      const resp = yield* _await(response.json());
      json = resp;
    } catch (error) {
      console.error("Parsing Error", error);
      return { details: "Parsing Error", ok: false, data: null };
    }

    let sale = this.sales.find((s) => s.id === details.sales);

    if (sale) {
      sale.addParticularLabor(json);
    }

    return { details: "", ok: true, data: json };
  });

  @modelFlow
  addItemParticularReturn = _async(function* (
    this: SaleStore,
    details: ReturnedItemInterface
  ) {
    let url: string;

    url = (yield* _await(AsyncStorage.getItem("@apiUrl"))) ?? "";

    let token: string;

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    let response: Response;

    response = yield* _await(
      fetch(`${url}/returned_items/`, {
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

    let json: ReturnedItem;
    try {
      const resp = yield* _await(response.json());
      json = resp;
    } catch (error) {
      console.error("Parsing Error", error);
      return { details: "Parsing Error", ok: false, data: null };
    }

    let sale = this.sales.find((s) => s.id === details.sales);

    if (sale) {
      sale.addParticularReturn(json);
    }

    return { details: "", ok: true, data: json };
  });

  @modelFlow
  updateItemParticularSale = _async(function* (
    this: SaleStore,
    details: SaleItemInterface,
    salesId: number,
    salesItemId: number
  ) {
    let sale = this.sales.find((s) => s.id === salesId);

    if (sale) {
      sale.updateParticularSale(details, salesItemId);
    }

    let url: string;

    url = (yield* _await(AsyncStorage.getItem("@apiUrl"))) ?? "";

    let token: string;

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    let response: Response;

    response = yield* _await(
      fetch(`${url}/sales_items/${salesItemId}/`, {
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

    let json: SalesItem;
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
  updateItemParticularLabor = _async(function* (
    this: SaleStore,
    details: LaborItemInterface,
    salesId: number,
    laborItemId: number
  ) {
    let sale = this.sales.find((s) => s.id === salesId);

    if (sale) {
      sale.updateParticularLabor(details, laborItemId);
    }
    let url: string;

    url = (yield* _await(AsyncStorage.getItem("@apiUrl"))) ?? "";

    let token: string;

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    let response: Response;

    response = yield* _await(
      fetch(`${url}/labor_items/${laborItemId}/`, {
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

    let json: LaborItem;
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
  deleteItemParticularSale = _async(function* (
    this: SaleStore,
    salesId: number,
    salesItemId: number
  ) {
    let sale = this.sales.find((s) => s.id === salesId);

    if (sale) {
      sale.deleteParticularSale(salesItemId);
    }

    let url: string;

    url = (yield* _await(AsyncStorage.getItem("@apiUrl"))) ?? "";

    let token: string;

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    let response: Response;

    response = yield* _await(
      fetch(`${url}/sales_items/${salesItemId}/`, {
        method: "DELETE",
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

    return { details: "", ok: true, data: null };
  });

  @modelFlow
  deleteItemParticularLabor = _async(function* (
    this: SaleStore,
    salesId: number,
    laborItemId: number
  ) {
    let sale = this.sales.find((s) => s.id === salesId);

    if (sale) {
      sale.deleteParticularLabor(laborItemId);
    }

    let url: string;

    url = (yield* _await(AsyncStorage.getItem("@apiUrl"))) ?? "";

    let token: string;

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    let response: Response;

    response = yield* _await(
      fetch(`${url}/labor_items/${laborItemId}/`, {
        method: "DELETE",
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

    return { details: "", ok: true, data: null };
  });
}

export const saleStore = new SaleStore({});
