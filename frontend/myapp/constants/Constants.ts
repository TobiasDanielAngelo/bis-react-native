import { Dimensions } from "react-native";
import {
  Customer,
  CustomerLaborItem,
  CustomerSalesItem,
  POSItem,
} from "./interfaces";

const { height, width } = Dimensions.get("window");

export const winHeight = height;
export const winWidth = width;

export const labors = [
  "Labor (Others)",
  "Rebore",
  "Press",
  "Tire Changer",
  "Overhaul",
  "Torno",
  "Asinta",
  "Palit Gulong",
  "Change Oil",
  "Honing",
  "Rimatse",
  "General",
];

export const defaultPOSItem = {
  id: -1,
  name: "",
  price: 0,
  quantity: -1,
} as POSItem;

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

export const defaultSparePart = {
  id: -1,
  name: "",
  is_motor_shown: true,
};

export const defaultLaborItem = {
  id: -1,
  custId: -1,
  laborer: "",
  description: "",
  cost: 0,
  collected: 0,
} as CustomerLaborItem;

export const defaultExpense = {
  id: -1,
  amount: 0,
  spender: "",
  remarks: "",
  datetimeTransacted: "",
  categoryId: "",
  receiptId: "",
};

export const defaultOrder = {
  id: -1,
  check: -1,
  dueDate: "",
  supplier: "",
  status: "editing" as "editing" | "processing" | "delivered" | "closed",
  toPrint: false,
};

export const defaultUser = {
  username: "",
  userId: "",
  firstName: "",
  lastName: "",
  privilege: "",
  isActive: true,
};

export const defaultProduct = {
  // part: "",
  brand: "",
  pieces: "1",
  unitPP: "",
  packPP: "",
  unitSP: "",
  packSP: "",
  miscInfo: "",
  location: "",
  minimum: "",
  unit: "pc.",
  isOrig: false,
};

export const defaultProductInterface = {
  id: "-1",
  piece_count: 0,
  unit: "pc.",
  description: "",
  brand: "",
  part: "",
  motors: "",
  // generic: "",
  datetime_added: "",
  is_active: true,
  location: "",
  purchase_price: 0,
  sell_price: 0,
  min_quantity: 1,
  is_orig: false,
};
