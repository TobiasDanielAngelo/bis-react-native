import { Dimensions } from "react-native";
import { Customer, CustomerLaborItem, CustomerSalesItem } from "./interfaces";

const { height, width } = Dimensions.get("window");

export const winHeight = height;
export const winWidth = width;

export const defaultCustomer = {
  id: -1,
  name: "",
  paymentStatus: "not paid",
  amountPaid: 0,
  amountPaidGCash: 0,
  discountSales: 0,
  toPrint: false,
  isClosed: false,
  dateTransacted: "",
} as Customer;

export const defaultSalesItem = {
  itemId: -1,
  custId: -1,
  qty: 0,
  claimed: false,
} as CustomerSalesItem;

export const defaultLaborItem = {
  id: -1,
  custId: -1,
  laborer: "",
  description: "",
  cost: 0,
  collected: 0,
} as CustomerLaborItem;
