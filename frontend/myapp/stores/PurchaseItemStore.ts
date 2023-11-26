import { Model, model, prop } from "mobx-keystone";

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
  get asJson() {
    return {};
  }

  update() {
    return this;
  }
}
