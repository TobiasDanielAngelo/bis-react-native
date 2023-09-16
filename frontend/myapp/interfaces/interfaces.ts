import { createContext } from "react";

export type POSItem = { id: number; name: string; price: number };

export type Customer = {
  id: number;
  name: string;
  paid: "not paid" | "validating" | "paid";
  amountPaid: number;
  amountPaidGCash: number;
  discountSales: number;
  toPrint: boolean;
  isClosed: boolean;
  dateTransacted: string;
};

export type CustomerLabor = {
  id: number;
  name: string;
  paid: "not paid" | "validating" | "paid";
  amountPaid: number;
  dateTransacted: string;
};

export type Item = {
  id: number;
  name: string;
  remarks: string;
  price: number;
};

export type CustomerSalesItem = {
  itemId: number;
  custId: number;
  qty: number;
  claimed: boolean;
};
export type CustomerLaborItem = {
  id: number;
  custId: number;
  laborer: string;
  description: string;
  cost: number;
  collected: number;
};

export type User = {
  username: string;
  userId: string;
  firstName: string;
  lastName: string;
  privilege: string;
  isActive: boolean;
};

export type MainContent = {
  currentUser: User;
};

export const MainContext = createContext<MainContent>({
  currentUser: {
    username: "",
    userId: "",
    firstName: "",
    lastName: "",
    privilege: "",
    isActive: true,
  },
});

export const defaultUser = {
  username: "",
  userId: "",
  firstName: "",
  lastName: "",
  privilege: "",
  isActive: true,
};

export type POSContent = {
  items: POSItem[];
  query: string;
  handleQueryChange: (q: string) => void;
  focused: boolean;
  handleFocusedChange: (f: boolean) => void;
  addItemToCart: (s: CustomerSalesItem) => void;
  customer: number;
  setCustomer: (c: number) => void;
  customers: Customer[];
  salesItem: number;
  salesItems: CustomerSalesItem[];
  laborItem: number;
  laborItems: CustomerLaborItem[];
  paymentStatus: "paid" | "not paid" | "validating";
};

export const POSContext = createContext<POSContent>({
  items: [],
  query: "",
  handleQueryChange: (q: string) => {},
  focused: false,
  handleFocusedChange: (f: boolean) => {},
  addItemToCart: (s: CustomerSalesItem) => {},
  customer: -1,
  setCustomer: (c: number) => {},
  customers: [],
  salesItem: -1,
  salesItems: [],
  laborItem: -1,
  laborItems: [],
  paymentStatus: "not paid",
});

export type RedeemContent = {
  laborItem: number;
  laborItems: CustomerLaborItem[];
  laborer: string;
  setLaborer: (l: string) => void;
  laborers: string[];
  customers: CustomerLabor[];
  handleGiven: (
    description: string,
    collected: number,
    customer: number
  ) => void;
};

export const RedeemContext = createContext<RedeemContent>({
  laborItem: -1,
  laborItems: [],
  laborer: "Others",
  setLaborer: (l: string) => {},
  laborers: [],
  customers: [],
  handleGiven: (description: string, collected: number, customer: number) => {},
});

export type RefundContent = {
  items: POSItem[];
  query: string;
  handleQueryChange: (q: string) => void;
  focused: boolean;
  handleFocusedChange: (f: boolean) => void;
  salesItem: number;
  salesItems: CustomerSalesItem[];
};

export const RefundContext = createContext<RefundContent>({
  items: [],
  query: "",
  handleQueryChange: (q: string) => {},
  focused: false,
  handleFocusedChange: (f: boolean) => {},
  salesItem: -1,
  salesItems: [],
});

export type ReviewContent = {
  items: POSItem[];
};

export const ReviewContext = createContext<ReviewContent>({
  items: [],
});

export type Expenses = {
  id: number;
  amount: number;
  spender: string;
  remarks: string;
  datetimeTransacted: string;
  categoryId: string;
  receiptId: number;
};

export type QuickExpenseContent = {};

export const QuickExpenseContext = createContext<QuickExpenseContent>({});
