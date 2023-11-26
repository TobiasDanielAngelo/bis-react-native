import { Model, model, prop } from "mobx-keystone";

export interface ReturnedItemInterface {
  id?: number;
  quantity?: number;
  description?: string;
  unit?: string;
  selling_price?: number;
  datetime_added?: string;
  sales?: number;
  product?: number;
  user?: string;
}

@model("myApp/ReturnedItem")
export class ReturnedItem extends Model({
  id: prop<number>(-1),
  quantity: prop<number>(0),
  description: prop<string>(""),
  unit: prop<string>(""),
  selling_price: prop<number>(0),
  datetime_added: prop<string>(""),
  sales: prop<number>(-1),
  product: prop<number>(-1),
  user: prop<string>(""),
}) {
  update(details: ReturnedItemInterface) {
    Object.assign(this, details);
  }
}
