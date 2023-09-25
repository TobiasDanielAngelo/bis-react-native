import { createContext } from "react";
import {
  defaultCustomer,
  defaultLaborItem,
  defaultSalesItem,
} from "./constants";

export type POSItem = { id: number; name: string; price: number };

export type Customer = {
  id: number;
  name: string;
  paymentStatus: "not paid" | "validating" | "paid";
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
  paymentStatus: "not paid" | "validating" | "paid";
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
  id: number;
  itemId: number;
  itemDescription: string;
  custId: number;
  qty: number;
  unitAmount: number;
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
  currentScreen: string;
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
  currentScreen: "",
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
  popup: string;
  query: string;
  focus: boolean;
  customer: Customer;
  customers: Customer[];
  salesItem: CustomerSalesItem;
  laborItem: CustomerLaborItem;
  salesItems: CustomerSalesItem[];
  laborItems: CustomerLaborItem[];
  setItems: (t: Item[]) => void;
  setPopup: (t: string) => void;
  onQueryChange: (t: string) => void;
  onFocusChange: (t: boolean) => void;
  setCustomer: (t: Customer | ((u: Customer) => Customer)) => void;
  setCustomers: (t: Customer[] | ((u: Customer[]) => Customer[])) => void;
  setSalesItem: (
    t: CustomerSalesItem | ((u: CustomerSalesItem) => CustomerSalesItem)
  ) => void;
  setLaborItem: (
    t: CustomerLaborItem | ((u: CustomerLaborItem) => CustomerLaborItem)
  ) => void;
  setSalesItems: (
    t: CustomerSalesItem[] | ((u: CustomerSalesItem[]) => CustomerSalesItem[])
  ) => void;
  setLaborItems: (
    t: CustomerLaborItem[] | ((u: CustomerLaborItem[]) => CustomerLaborItem[])
  ) => void;
  togglePayment: (
    status: "paid" | "validating" | "not paid",
    paidAmt?: number,
    discSalesAmt?: number,
    paidGCashAmt?: number
  ) => void;
  currentTotal: number;
};

export const POSContext = createContext<POSContent>({
  items: [],
  popup: "",
  query: "",
  focus: false,
  customer: defaultCustomer,
  customers: [],
  salesItem: defaultSalesItem,
  laborItem: defaultLaborItem,
  salesItems: [],
  laborItems: [],
  setItems: (t: Item[]) => {},
  setPopup: (t: string) => {},
  onQueryChange: (t: string) => {},
  onFocusChange: (t: boolean) => {},
  setCustomer: (t: Customer | ((u: Customer) => Customer)) => {},
  setCustomers: (t: Customer[] | ((u: Customer[]) => Customer[])) => {},
  setSalesItem: (
    t: CustomerSalesItem | ((u: CustomerSalesItem) => CustomerSalesItem)
  ) => {},
  setLaborItem: (
    t: CustomerLaborItem | ((u: CustomerLaborItem) => CustomerLaborItem)
  ) => {},
  setSalesItems: (
    t: CustomerSalesItem[] | ((u: CustomerSalesItem[]) => CustomerSalesItem[])
  ) => {},
  setLaborItems: (
    t: CustomerLaborItem[] | ((u: CustomerLaborItem[]) => CustomerLaborItem[])
  ) => {},
  togglePayment: (
    status: "paid" | "validating" | "not paid",
    paidAmt?: number,
    discSalesAmt?: number,
    paidGCashAmt?: number
  ) => {},
  currentTotal: 0,
});

export type RedeemContent = {
  laborItem: CustomerLaborItem;
  laborItems: CustomerLaborItem[];
  setLaborItem: (
    t: CustomerLaborItem | ((u: CustomerLaborItem) => CustomerLaborItem)
  ) => void;
  setLaborItems: (
    t: CustomerLaborItem[] | ((u: CustomerLaborItem[]) => CustomerLaborItem[])
  ) => void;
  laborer: string;
  setLaborer: (l: string) => void;
  laborers: string[];
  customers: CustomerLabor[];
};

export const RedeemContext = createContext<RedeemContent>({
  laborItem: defaultLaborItem,
  laborItems: [],
  setLaborItem: (
    t: CustomerLaborItem | ((u: CustomerLaborItem) => CustomerLaborItem)
  ) => {},
  setLaborItems: (
    t: CustomerLaborItem[] | ((u: CustomerLaborItem[]) => CustomerLaborItem[])
  ) => {},
  laborer: "Others",
  setLaborer: (l: string) => {},
  laborers: [],
  customers: [],
});

export type RefundContent = {
  items: POSItem[];
  query: string;
  onQueryChange: (q: string) => void;
  focus: boolean;
  onFocusChange: (f: boolean) => void;
  salesItem: number;
  salesItems: CustomerSalesItem[];
};

export const RefundContext = createContext<RefundContent>({
  items: [],
  query: "",
  onQueryChange: (q: string) => {},
  focus: false,
  onFocusChange: (f: boolean) => {},
  salesItem: -1,
  salesItems: [],
});

export type ParticularTransaction = {
  id?: string;
  description?: string;
  remarks?: string;
  quantity?: number;
  unit_amount?: number;
};

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

export const defaultExpense = {
  id: -1,
  amount: 0,
  spender: "",
  remarks: "",
  datetimeTransacted: "",
  categoryId: "",
  receiptId: 0,
};

export type QuickExpenseContent = {};

export const QuickExpenseContext = createContext<QuickExpenseContent>({});

export type ExpenseReviewContent = {
  expense: Expenses;
  setExpense: (e: Expenses) => void;
  popup: string;
  setPopup: (popup: string) => void;
};

export const ExpenseReviewContext = createContext<ExpenseReviewContent>({
  expense: defaultExpense,
  setExpense: (e: Expenses) => {},
  popup: "",
  setPopup: (popup: string) => {},
});
