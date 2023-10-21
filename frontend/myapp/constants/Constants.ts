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

export const monthYears = () => {
  let arr = Array.from(Array(18).keys()).map((s) => 100 * s + 202300);
  let newArr = [] as number[];

  arr.forEach((s) => {
    newArr.push(
      ...Array(12)
        .fill(s)
        .map((t, ind) => t + ind + 1)
    );
  });

  return newArr;
};

export const defaultInventoryHistory = {
  id: -1,
  type: "" as "count" | "purchase" | "",
  particulars: [],
  receiver: "",
  encoder: "",
  dateTransacted: "",
  dueDate: "",
  checkNum: "",
};

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
  is_semi_shown: false,
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
  print_count: 0,
};

export const defaultProductQuantified = {
  product: defaultProductInterface,
  quantity: 0,
};

export const defaultSession = {
  id: "-1",
  isOngoing: false,
  location: "",
  counter: "",
  lastProdId: -1,
};

export const defaultProductFullyQuantified = {
  product: defaultProductInterface,
  quantity: 0,
  sold: 0,
  returned: 0,
  purchased: 0,
  gained: 0,
  lost: 0,
};

export const priceCodes = [
  { number: "1", code: "L" },
  { number: "2", code: "U" },
  { number: "3", code: "C" },
  { number: "4", code: "K" },
  { number: "5", code: "Y" },
  { number: "6", code: "S" },
  { number: "7", code: "T" },
  { number: "8", code: "O" },
  { number: "9", code: "R" },
  { number: "0", code: "E" },
];
