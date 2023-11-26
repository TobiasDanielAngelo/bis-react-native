import { Model, model, prop } from "mobx-keystone";

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
  get asJson() {
    return {};
  }
}
