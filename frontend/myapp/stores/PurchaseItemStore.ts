import { Model, model, prop } from "mobx-keystone";

export interface PurchaseItemInterface {
  id?: number;
  purchase?: number;
  product?: number;
  description?: string;
  unit?: string;
  quantity?: number;
  is_valid?: boolean;
  purchase_price?: number;
  user_adder?: string;
  user_giver?: string;
  datetime_added?: string;
  datetime_claimed?: string;
}

@model("myApp/PurchaseItem")
export class PurchaseItem extends Model({
  id: prop<number>(-1),
  purchase: prop<number>(-1),
  product: prop<number>(-1),
  description: prop<string>(""),
  unit: prop<string>(""),
  quantity: prop<number>(0),
  is_valid: prop<boolean>(false),
  purchase_price: prop<number>(0),
  user_adder: prop<string>(""),
  user_giver: prop<string>(""),
  datetime_added: prop<string>(""),
  datetime_claimed: prop<string>(""),
}) {
  update(details: PurchaseItemInterface) {
    Object.assign(this, details);
  }
}
