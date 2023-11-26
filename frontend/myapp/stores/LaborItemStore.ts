import { Model, model, prop } from "mobx-keystone";

@model("myApp/LaborItem")
export class LaborItem extends Model({
  id: prop<number>(-1),
  labor_name: prop<string>(""),
  is_done: prop<boolean>(false),
  amount_received: prop<number>(0),
  amount_returned: prop<number>(0),
  amount_owed: prop<number>(0),
  datetime_added: prop<string>(""),
  datetime_done: prop<string>(""),
  sales: prop<number>(-1),
  mechanic: prop<number>(-1),
  user_adder: prop<string>(""),
  user_giver: prop<string>(""),
}) {
  get asJson() {
    return {};
  }

  update() {
    return this;
  }
}
