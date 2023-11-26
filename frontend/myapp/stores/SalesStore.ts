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
import { LaborItem } from "./LaborItemStore";
import { ReturnedItem } from "./ReturnedItemStore";
import { SalesItem } from "./SalesItemStore";

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
  get asJson() {
    return {
      id: this.id,
      payment: this.payment,
      status: this.status,
      customer_name: this.customer_name,
      datetime_opened: this.datetime_opened,
      datetime_closed: this.datetime_closed,
      is_active: this.is_active,
      discount: this.discount,
      user_adder: this.user_adder,
      user_validator: this.user_validator,
      user_closer: this.user_closer,
      sales_item: this.sales_item,
      labor_item: this.labor_item,
      returned_item: this.returned_item,
    };
  }

  update(details: SaleInterface) {
    this.payment = details.payment ?? this.payment;
    this.to_print = details.to_print ?? this.to_print;
    this.status = details.status ?? this.status;
    this.customer_name = details.customer_name ?? this.customer_name;
    this.datetime_opened = details.datetime_opened ?? this.datetime_opened;
    this.datetime_closed = details.datetime_closed ?? this.datetime_closed;
    this.is_active = details.is_active ?? this.is_active;
    this.discount = details.discount ?? this.discount;
    this.user_adder = details.user_adder ?? this.user_adder;
    this.user_validator = details.user_validator ?? this.user_validator;
    this.user_closer = details.user_closer ?? this.user_closer;
    this.sales_item = details.sales_item ?? this.sales_item;
    this.labor_item = details.labor_item ?? this.labor_item;
    this.returned_item = details.returned_item ?? this.returned_item;
    return this;
  }

  updateParticularSale(
    details: {
      quantity?: number;
      is_claimed?: boolean;
      datetime_claimed?: string;
      user_giver?: string;
    },
    salesItemId: number
  ) {
    let salesItem = this.sales_item.find((s) => s.id === salesItemId);
    if (salesItem) {
      salesItem.quantity = details.quantity ?? salesItem.quantity;
      salesItem.is_claimed = details.is_claimed ?? salesItem.is_claimed;
      salesItem.datetime_claimed =
        details.datetime_claimed ?? salesItem.datetime_claimed;
      salesItem.user_giver = details.user_giver ?? salesItem.user_giver;
    }
    return this;
  }

  addParticularSale(details: SalesItem) {
    this.sales_item.push(details);
    return this;
  }

  addParticularLabor(details: LaborItem) {
    this.labor_item.push(details);
    return this;
  }

  addParticularReturn(details: ReturnedItem) {
    this.returned_item.push(details);
    return this;
  }

  updateParticularLabor(
    details: {
      labor_name?: string;
      is_done?: boolean;
      amount_received?: number;
      amount_returned?: number;
      amount_owed?: number;
      datetime_done?: string;
      mechanic?: number;
      user_giver?: string;
    },
    laborItemId: number
  ) {
    let laborItem = this.labor_item.find((s) => s.id === laborItemId);
    if (laborItem) {
      laborItem.labor_name = details.labor_name ?? laborItem.labor_name;
      laborItem.is_done = details.is_done ?? laborItem.is_done;
      laborItem.amount_received =
        details.amount_received ?? laborItem.amount_received;
      laborItem.amount_returned =
        details.amount_returned ?? laborItem.amount_returned;
      laborItem.amount_owed = details.amount_owed ?? laborItem.amount_owed;
      laborItem.datetime_done =
        details.datetime_done ?? laborItem.datetime_done;
      laborItem.mechanic = details.mechanic ?? laborItem.mechanic;
      laborItem.user_giver = details.user_giver ?? laborItem.user_giver;
    }
    return this;
  }

  deleteParticularSale(salesItemId: number) {
    this.sales_item.splice(
      this.sales_item.findIndex((s) => s.id === salesItemId),
      1
    );
    return this;
  }

  deleteParticularLabor(laborItemId: number) {
    this.labor_item.splice(
      this.labor_item.findIndex((s) => s.id === laborItemId),
      1
    );
    return this;
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

    let token: string;

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    let response: Response;

    response = yield* _await(
      fetch(`${process.env["BASE_URL"]}/sales2/${query}`, {
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
        this.sales
          .find((t) => t.id === s.id ?? -1)
          ?.update({
            id: s.id,
            to_print: s.to_print,
            status: s.status,
            payment: s.payment,
            customer_name: s.customer_name,
            datetime_opened: s.datetime_opened,
            datetime_closed: s.datetime_closed,
            is_active: s.is_active,
            discount: s.discount,
            user_adder: s.user_adder,
            user_validator: s.user_validator,
            user_closer: s.user_closer,
            sales_item: s.sales_item,
            labor_item: s.labor_item,
            returned_item: s.returned_item,
          });
      }
    });

    return { details: "", ok: true, data: json };
  });

  @modelFlow
  fetchOne = _async(function* (this: SaleStore, id: number) {
    let token: string;

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    let response: Response;

    response = yield* _await(
      fetch(`${process.env["BASE_URL"]}/sales2/${id}/`, {
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
      this.sales
        .find((t) => t.id === id ?? -1)
        ?.update({
          id: json.id,
          to_print: json.to_print,
          status: json.status,
          payment: json.payment,
          customer_name: json.customer_name,
          datetime_opened: json.datetime_opened,
          datetime_closed: json.datetime_closed,
          is_active: json.is_active,
          discount: json.discount,
          user_adder: json.user_adder,
          user_validator: json.user_validator,
          user_closer: json.user_closer,
          sales_item: json.sales_item,
          labor_item: json.labor_item,
          returned_item: json.returned_item,
        });
    }

    return { details: "", ok: true, data: json };
  });
  @modelFlow
  addItem = _async(function* (this: SaleStore, customerName: string) {
    const user = JSON.parse(
      (yield* _await(AsyncStorage.getItem("@currentUser"))) ?? ""
    );

    let token: string;

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    const details = {
      user_adder: user?.user_id,
      customer_name: customerName,
    };

    let response: Response;

    response = yield* _await(
      fetch(`${process.env["BASE_URL"]}/sales2/`, {
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
    details: {
      to_print?: boolean;
      payment?: number[];
      status?: string;
      customer_name?: string;
      datetime_closed?: string;
      is_active?: boolean;
      discount?: number;
      user_validator?: string;
      user_closer?: string;
    }
  ) {
    this.sales
      .find((s) => saleId === s.id ?? -1)
      ?.update({
        to_print: details.to_print,
        payment: details.payment,
        status: details.status,
        customer_name: details.customer_name,
        datetime_closed: details.datetime_closed,
        is_active: details.is_active,
        discount: details.discount,
        user_validator: details.user_validator,
        user_closer: details.user_closer,
      });

    let token: string;

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    let response: Response;

    response = yield* _await(
      fetch(`${process.env["BASE_URL"]}/sales2/${saleId}/`, {
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
    details: {
      description: string;
      unit: string;
      selling_price: number;
      product: number;
      sales: number;
      quantity: number;
    }
  ) {
    let token: string;

    const user = JSON.parse(
      (yield* _await(AsyncStorage.getItem("@currentUser"))) ?? ""
    );

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    let response: Response;

    response = yield* _await(
      fetch(`${process.env["BASE_URL"]}/sales_items/`, {
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
    details: {
      labor_name: string;
      amount_received: number;
      amount_returned: number;
      amount_owed: number;
      sales: number;
      mechanic: number;
    }
  ) {
    let token: string;

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    let response: Response;

    response = yield* _await(
      fetch(`${process.env["BASE_URL"]}/labor_items/`, {
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
    details: {
      quantity: number;
      selling_price: number;
      unit: string;
      description: string;
      datetime_added: string;
      sales: number;
      product: number;
    }
  ) {
    let token: string;

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    let response: Response;

    response = yield* _await(
      fetch(`${process.env["BASE_URL"]}/returned_items/`, {
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
    details: {
      quantity?: number;
      is_claimed?: boolean;
      datetime_claimed?: string;
      user_giver?: string;
      to_print?: boolean;
      payment?: number[];
    },
    salesId: number,
    salesItemId: number
  ) {
    let sale = this.sales.find((s) => s.id === salesId);

    if (sale) {
      sale.updateParticularSale(details, salesItemId);
    }

    let token: string;

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    let response: Response;

    response = yield* _await(
      fetch(`${process.env["BASE_URL"]}/sales_items/${salesItemId}/`, {
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
    details: {
      labor_name?: string;
      is_done?: boolean;
      amount_received?: number;
      amount_returned?: number;
      amount_owed?: number;
      datetime_done?: string;
      mechanic?: number;
      user_giver?: string;
    },
    salesId: number,
    laborItemId: number
  ) {
    let sale = this.sales.find((s) => s.id === salesId);

    if (sale) {
      sale.updateParticularLabor(details, laborItemId);
    }

    let token: string;

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    let response: Response;

    response = yield* _await(
      fetch(`${process.env["BASE_URL"]}/labor_items/${laborItemId}/`, {
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
    let token: string;

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    let response: Response;

    response = yield* _await(
      fetch(`${process.env["BASE_URL"]}/sales_items/${salesItemId}/`, {
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
    let token: string;

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    let response: Response;

    response = yield* _await(
      fetch(`${process.env["BASE_URL"]}/labor_items/${laborItemId}/`, {
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
