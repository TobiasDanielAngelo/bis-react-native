import { createContext } from "react";
import {
  defaultBills,
  defaultCoins,
  defaultCustomer,
  defaultExpense,
  defaultLaborItem,
  defaultPOSItem,
  defaultProduct,
  defaultProductFullyQuantified,
  defaultProductInterface,
  defaultProductQuantified,
  defaultReport,
  defaultSalesItem,
  defaultSession,
  defaultUser,
} from "./constants";

export interface PurchaseOrder {
  id: number;
  check: number;
  dueDate: string;
  creationDate: string;
  supplier: string;
  status: "editing" | "processing" | "delivered" | "closed";
  toPrint: boolean;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  qty: number;
  purchasePrice: number;
  sellPrice: number;
  brandType: "none" | "any" | "";
}

export interface CategoryInterface {
  pk: string;
  nature: string;
  title: string;
  logo: string;
}

export interface AccountInterface {
  id?: string;
  name: string;
  datetime_transacted: string;
}

export interface Customer {
  id: number;
  name: string;
  paymentStatus: "not paid" | "validating" | "paid";
  amountPaid: number;
  amountPaidGCash: number;
  discountSales: number;
  toPrint: boolean;
  isClosed: boolean;
  dateTransacted: string;
}
export interface CustomerLabor {
  id: number;
  name: string;
  paymentStatus: "not paid" | "validating" | "paid";
  amountPaid: number;
  dateTransacted: string;
}
export interface CustomerLaborItem {
  id: number;
  custId: number;
  laborer: string;
  description: string;
  cost: number;
  collected: number;
}
export interface CustomerSalesItem {
  id: number;
  itemId: number;
  itemDescription: string;
  custId: number;
  qty: number;
  unitAmount: number;
  claimed: boolean;
}
export interface Expense {
  id: number;
  amount: number;
  spender: string;
  remarks: string;
  datetimeTransacted: string;
  categoryId: string;
  receiptId: string;
}

export interface LoginInterface {
  username: string;
  password: string;
}

export interface MotorInterface {
  id: number;
  name: string;
  maker: string;
}

export interface SparePartInterface {
  id: number;
  name: string;
  is_motor_shown: boolean;
  is_semi_shown: boolean;
}

export interface MechanicInterface {
  id: number;
  name: string;
  color: string;
}

export interface ParticularTransaction {
  id?: string;
  description?: string;
  remarks?: string;
  quantity?: number;
  unit_amount?: number;
  transaction?: number;
}
export interface POSItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}
export interface ProductInterface {
  id?: string;
  piece_count: number;
  unit: string;
  description: string;
  brand: string;
  part: string;
  motors: string;
  // generic: string;
  datetime_added: string;
  is_active: boolean;
  location: string;
  purchase_price: number;
  sell_price: number;
  min_quantity: number;
  is_orig: boolean;
  print_count: number;
}

export interface ProductUpdateInterface {
  piece_count?: number;
  unit?: string;
  description?: string;
  brand?: string;
  part?: string;
  motors?: string;
  datetime_added?: string;
  is_active?: boolean;
  location?: string;
  purchase_price?: number;
  sell_price?: number;
  min_quantity?: number;
  is_orig?: boolean;
  print_count?: number;
}

export interface TransactionInputInterface {
  category: string;
  description: string;
  transmitter: string;
  receiver: string;
  particular_transaction: ParticularTransaction[];
}

export interface TransactionInterface {
  pk?: string;
  category: string;
  description: string;
  datetime_transacted: string;
  encoder: string;
  transmitter: string;
  receiver: string;
  particular_transaction: ParticularTransaction[];
}
export interface TransactionUpdateInterface {
  id?: string;
  category?: string;
  description?: string;
  transmitter?: string;
  receiver?: string;
  particular_transaction?: ParticularTransaction[];
}

export interface DurationDays {
  duration: "5Y" | "2Y" | "1Y" | "1B" | "1Q" | "1M" | "1W" | "3D";
  days: number;
  format: string;
}

export interface DatePrice {
  date: Date;
  price: number;
}

export interface Report {
  opened: boolean;
  id: number;
  pcvId: number;
  moneyArr: string;
}

export interface AccountBalance {
  account: AccountInterface;
  balance: number;
}

export interface DatePriceLoading {
  date: Date;
  price: number;
  loading: boolean;
}

export interface Transfer {
  id: number;
  datetime_transacted: string;
  transmitter: string;
  receiver: string;
  amount: number;
  encoder: string;
  message: string;
}

export interface User {
  username: string;
  userId: string;
  firstName: string;
  lastName: string;
  privilege: string;
  isActive: boolean;
}
export interface UserInterface {
  username: string;
  userId: string;
  firstName: string;
  lastName: string;
  privilege: string;
  isActive: boolean;
}

export interface CountSession {
  id: string;
  counter: string;
  isOngoing: boolean;
  location: string;
}

export type Bills = typeof defaultBills;

export type Coins = typeof defaultCoins;

export interface ProductQuantified {
  product: ProductInterface;
  quantity: number;
}

export interface ProductFullyQuantified {
  product: ProductInterface;
  quantity: number;
  sold: number;
  returned: number;
  purchased: number;
  gained: number;
  lost: number;
}

export interface InventoryHistory {
  id: number;
  type: "count" | "purchase" | "";
  particulars: ParticularTransaction[];
  receiver: string;
  encoder: string;
  dateTransacted: string;
  dueDate: string;
  checkNum: string;
}

export type MainContent = { currentUser: User; currentScreen: string };

export const MainContext = createContext<MainContent>({
  currentUser: defaultUser,
  currentScreen: "",
});

export type M1S1Content = {
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
  setItems: (t: POSItem[] | ((u: POSItem[]) => POSItem[])) => void;
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
  refreshCount: number;
  setRefreshCount: (t: number | ((u: number) => number)) => void;
};

export const M1S1Context = createContext<M1S1Content>({
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
  setItems: (t: POSItem[] | ((u: POSItem[]) => POSItem[])) => {},
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
  refreshCount: 0,
  setRefreshCount: (t: number | ((u: number) => number)) => {},
});

export type M1S2Content = {
  laborItem: CustomerLaborItem;
  laborItems: CustomerLaborItem[];
  setLaborItem: (
    t: CustomerLaborItem | ((u: CustomerLaborItem) => CustomerLaborItem)
  ) => void;
  setLaborItems: (
    t: CustomerLaborItem[] | ((u: CustomerLaborItem[]) => CustomerLaborItem[])
  ) => void;
  laborer: string;
  setLaborer: (t: string) => void;
  laborers: MechanicInterface[];
  customers: CustomerLabor[];
};

export const M1S2Context = createContext<M1S2Content>({
  laborItem: defaultLaborItem,
  laborItems: [],
  setLaborItem: (
    t: CustomerLaborItem | ((u: CustomerLaborItem) => CustomerLaborItem)
  ) => {},
  setLaborItems: (
    t: CustomerLaborItem[] | ((u: CustomerLaborItem[]) => CustomerLaborItem[])
  ) => {},
  laborer: "Others",
  setLaborer: (t: string) => {},
  laborers: [],
  customers: [],
});

export type M1S3Content = {
  item: POSItem;
  items: POSItem[];
  query: string;
  onQueryChange: (t: string) => void;
  focus: boolean;
  onFocusChange: (t: boolean) => void;
  customer: Customer;
  customers: Customer[];
  salesItem: CustomerSalesItem;
  salesItems: CustomerSalesItem[];
  returnItem: CustomerSalesItem;
  returnItems: CustomerSalesItem[];
  setItem: (t: POSItem | ((u: POSItem) => POSItem)) => void;
  setItems: (t: POSItem[] | ((u: POSItem[]) => POSItem[])) => void;
  setCustomer: (t: Customer) => void;
  setSalesItem: (
    t: CustomerSalesItem | ((u: CustomerSalesItem) => CustomerSalesItem)
  ) => void;
  setReturnItem: (
    t: CustomerSalesItem | ((u: CustomerSalesItem) => CustomerSalesItem)
  ) => void;
  setSalesItems: (
    t: CustomerSalesItem[] | ((u: CustomerSalesItem[]) => CustomerSalesItem[])
  ) => void;
  setReturnItems: (
    t: CustomerSalesItem[] | ((u: CustomerSalesItem[]) => CustomerSalesItem[])
  ) => void;
  popup: string;
  setPopup: (t: string) => void;
};

export const M1S3Context = createContext<M1S3Content>({
  item: defaultPOSItem,
  items: [],
  query: "",
  onQueryChange: (t: string) => {},
  focus: false,
  onFocusChange: (t: boolean) => {},
  customer: defaultCustomer,
  customers: [],
  setCustomer: (t: Customer) => {},
  salesItem: defaultSalesItem,
  salesItems: [],
  returnItem: defaultSalesItem,
  returnItems: [],
  setItem: (t: POSItem | ((u: POSItem) => POSItem)) => {},
  setItems: (t: POSItem[] | ((u: POSItem[]) => POSItem[])) => {},
  setSalesItem: (
    t: CustomerSalesItem | ((u: CustomerSalesItem) => CustomerSalesItem)
  ) => {},
  setReturnItem: (
    t: CustomerSalesItem | ((u: CustomerSalesItem) => CustomerSalesItem)
  ) => {},
  setSalesItems: (
    t: CustomerSalesItem[] | ((u: CustomerSalesItem[]) => CustomerSalesItem[])
  ) => {},
  setReturnItems: (
    t: CustomerSalesItem[] | ((u: CustomerSalesItem[]) => CustomerSalesItem[])
  ) => {},
  popup: "",
  setPopup: (t: string) => {},
});

export type M1S4Content = {
  customer: Customer;
  setCustomer: (t: Customer) => void;
  customers: Customer[];
  salesItems: CustomerSalesItem[];
  laborItems: CustomerLaborItem[];
  returnItems: CustomerSalesItem[];
  date: Date;
};

export const M1S4Context = createContext<M1S4Content>({
  customer: defaultCustomer,
  setCustomer: (t: Customer) => {},
  customers: [],
  salesItems: [],
  laborItems: [],
  returnItems: [],
  date: new Date(),
});

export type M2S1Content = {
  categories: CategoryInterface[];
  viewHistory: boolean;
  setViewHistory: (t: boolean | ((u: boolean) => boolean)) => void;
  expenses: Expense[];
  setExpenses: (t: Expense[] | ((u: Expense[]) => Expense[])) => void;
  accounts: AccountInterface[];
  setAccounts: (
    t: AccountInterface[] | ((u: AccountInterface[]) => AccountInterface[])
  ) => void;
};

export const M2S1Context = createContext<M2S1Content>({
  categories: [],
  viewHistory: false,
  setViewHistory: (t: boolean | ((u: boolean) => boolean)) => {},
  expenses: [],
  setExpenses: (t: Expense[] | ((u: Expense[]) => Expense[])) => {},
  accounts: [],
  setAccounts: (
    t: AccountInterface[] | ((u: AccountInterface[]) => AccountInterface[])
  ) => {},
});

export type M2S2Content = {
  expense: Expense;
  setExpense: (t: Expense) => void;
  expenses: Expense[];
  setExpenses: (t: Expense[] | ((u: Expense[]) => Expense[])) => void;
  popup: string;
  setPopup: (t: string) => void;
  date: Date;
};

export const M2S2Context = createContext<M2S2Content>({
  expense: defaultExpense,
  setExpense: (t: Expense) => {},
  expenses: [],
  setExpenses: (t: Expense[] | ((u: Expense[]) => Expense[])) => {},
  popup: "",
  setPopup: (t: string) => {},
  date: new Date(),
});

export type M2S3Content = {
  expense: Expense;
  setExpense: (t: Expense) => void;
  popup: string;
  setPopup: (t: string) => void;
};
export const M2S3Context = createContext<M2S3Content>({
  expense: defaultExpense,
  setExpense: (t: Expense) => {},
  popup: "",
  setPopup: (t: string) => {},
});

export type InventoryContent = {
  mode: string;
  setMode: (t: string) => void;
  view: string;
  setView: (t: string) => void;
  item: ProductInterface;
  setItem: (
    t: ProductInterface | ((u: ProductInterface) => ProductInterface)
  ) => void;
  part: number;
  setPart: (t: any) => void;
  product: typeof defaultProduct;
  setProduct: (t: typeof defaultProduct) => void;
  selectedMotors: number[];
  setSelectedMotors: (t: number[] | ((u: number[]) => number[])) => void;
  items: ProductInterface[];
  setItems: (
    t: ProductInterface[] | ((u: ProductInterface[]) => ProductInterface[])
  ) => void;
};

export const InventoryContext = createContext<InventoryContent>({
  mode: "",
  setMode: (t: string) => {},
  view: "",
  setView: (t: string) => {},
  item: defaultProductInterface,
  setItem: (
    t: ProductInterface | ((u: ProductInterface) => ProductInterface)
  ) => {},
  part: -1,
  setPart: (t: any) => {},
  product: defaultProduct,
  setProduct: (t: typeof defaultProduct) => {},
  selectedMotors: [],
  setSelectedMotors: (t: number[] | ((u: number[]) => number[])) => {},
  items: [],
  setItems: (
    t: ProductInterface[] | ((u: ProductInterface[]) => ProductInterface[])
  ) => {},
});

export type M3S1Content = {
  viewProducts: boolean;
  popup: string;
  setPopup: (t: string) => void;
  loading: boolean;
  setLoading: (t: boolean) => void;
  products: ProductQuantified[];
  setProducts: (
    t: ProductQuantified[] | ((u: ProductQuantified[]) => ProductQuantified[])
  ) => void;
  part: number;
  setPart: (t: any) => void;
  parts: SparePartInterface[];
  order: number;
  setOrder: (t: any) => void;
  orders: PurchaseOrder[];
  setOrders: (
    t: PurchaseOrder[] | ((u: PurchaseOrder[]) => PurchaseOrder[])
  ) => void;
  orderItems: OrderItem[];
  setOrderItems: (t: OrderItem[] | ((u: OrderItem[]) => OrderItem[])) => void;
};

export const M3S1Context = createContext<M3S1Content>({
  viewProducts: false,
  popup: "",
  setPopup: (t: string) => {},
  loading: false,
  setLoading: (t: boolean) => {},
  products: [],
  setProducts: (
    t: ProductQuantified[] | ((u: ProductQuantified[]) => ProductQuantified[])
  ) => {},
  part: -1,
  setPart: (t: number) => {},
  parts: [],
  order: -1,
  setOrder: (t: any) => {},
  orders: [],
  setOrders: (
    t: PurchaseOrder[] | ((u: PurchaseOrder[]) => PurchaseOrder[])
  ) => {},
  orderItems: [],
  setOrderItems: (t: OrderItem[] | ((u: OrderItem[]) => OrderItem[])) => {},
});

export type M3S2Content = {
  motors: MotorInterface[];
  query: string;
  onQueryChange: (t: string) => void;
  focus: boolean;
  onFocusChange: (t: boolean) => void;
};

export const M3S2Context = createContext<M3S2Content>({
  motors: [],
  query: "",
  onQueryChange: (t: string) => {},
  focus: false,
  onFocusChange: (t: boolean) => {},
});

export type M3S3Content = {
  search: boolean;
  setSearch: (t: boolean | ((u: boolean) => boolean)) => void;
  popup: string;
  setPopup: (t: string) => void;
  loading: boolean;
  setLoading: (t: boolean) => void;
  query: string;
  onQueryChange: (t: string) => void;
  focus: boolean;
  onFocusChange: (t: boolean) => void;
  products: ProductQuantified[];
  part: number;
  setPart: (t: any) => void;
  parts: SparePartInterface[];
  order: number;
  setOrder: (t: any) => void;
  orders: PurchaseOrder[];
  setOrders: (
    t: PurchaseOrder[] | ((u: PurchaseOrder[]) => PurchaseOrder[])
  ) => void;
  orderItems: OrderItem[];
  setOrderItems: (t: OrderItem[] | ((u: OrderItem[]) => OrderItem[])) => void;
};

export const M3S3Context = createContext<M3S3Content>({
  search: false,
  setSearch: (t: boolean | ((u: boolean) => boolean)) => {},
  popup: "",
  setPopup: (t: string) => {},
  loading: false,
  setLoading: (t: boolean) => {},
  query: "",
  onQueryChange: (t: string) => {},
  focus: false,
  onFocusChange: (t: boolean) => {},
  products: [],
  part: -1,
  setPart: (t: number) => {},
  parts: [],
  order: -1,
  setOrder: (t: any) => {},
  orders: [],
  setOrders: (
    t: PurchaseOrder[] | ((u: PurchaseOrder[]) => PurchaseOrder[])
  ) => {},
  orderItems: [],
  setOrderItems: (t: OrderItem[] | ((u: OrderItem[]) => OrderItem[])) => {},
});

export type M3S4Content = {
  popup: string;
  setPopup: (t: string) => void;
  products: ProductFullyQuantified[];
  setProducts: (
    t:
      | ProductFullyQuantified[]
      | ((u: ProductFullyQuantified[]) => ProductFullyQuantified[])
  ) => void;
  productDetails: ProductFullyQuantified;
  setProductDetails: (t: any) => void;
  loading: boolean;
  setLoading: (t: boolean) => void;
  sessions: CountSession[];
  setSessions: (
    t: CountSession[] | ((u: CountSession[]) => CountSession[])
  ) => void;
  session: CountSession;
  setSession: (t: CountSession | ((u: CountSession) => CountSession)) => void;
  location: string;
  setLocation: (t: string | ((u: string) => string)) => void;
};

export const M3S4Context = createContext<M3S4Content>({
  popup: "",
  setPopup: (t: string) => {},
  products: [],
  setProducts: (
    t:
      | ProductFullyQuantified[]
      | ((u: ProductFullyQuantified[]) => ProductFullyQuantified[])
  ) => {},
  productDetails: defaultProductFullyQuantified,
  setProductDetails: (t: any) => {},
  loading: false,
  setLoading: (t: boolean) => {},
  sessions: [],
  setSessions: (
    t: CountSession[] | ((u: CountSession[]) => CountSession[])
  ) => {},
  session: defaultSession,
  setSession: (t: CountSession | ((u: CountSession) => CountSession)) => {},
  location: "",
  setLocation: (t: string | ((u: string) => string)) => {},
});

export type M3S5Content = {
  date: number;
  setDate: (t: number | ((u: number) => number)) => void;
  transactions: InventoryHistory[];
  transaction: number;
  setTransactions: (
    t: InventoryHistory[] | ((u: InventoryHistory[]) => InventoryHistory[])
  ) => void;
  setTransaction: (t: number | ((u: number) => number)) => void;
};

export const M3S5Context = createContext<M3S5Content>({
  date: 202301,
  setDate: (t: number | ((u: number) => number)) => {},
  transactions: [],
  transaction: -1,
  setTransactions: (
    t: InventoryHistory[] | ((u: InventoryHistory[]) => InventoryHistory[])
  ) => {},
  setTransaction: (t: number | ((u: number) => number)) => {},
});

export type FinanceContent = {
  mode: string;
  setMode: (t: string) => void;
  view: string;
  setView: (t: string) => void;
};

export const FinanceContext = createContext<FinanceContent>({
  mode: "",
  setMode: (t: string) => {},
  view: "",
  setView: (t: string) => {},
});

export type M4S1Content = {
  accounts: AccountInterface[];
  setAccounts: (
    t: AccountInterface[] | ((u: AccountInterface[]) => AccountInterface[])
  ) => void;
  transfers: Transfer[];
  setTransfers: (t: Transfer[] | ((u: Transfer[]) => Transfer[])) => void;
};

export const M4S1Context = createContext<M4S1Content>({
  accounts: [],
  setAccounts: (
    t: AccountInterface[] | ((u: AccountInterface[]) => AccountInterface[])
  ) => {},
  transfers: [],
  setTransfers: (t: Transfer[] | ((u: Transfer[]) => Transfer[])) => {},
});

export type M4S2Content = {
  mode: string;
  setMode: (t: string) => void;
  report: Report;
  setReport: (t: Report | ((u: Report) => Report)) => void;
  bills: Bills;
  setBills: (t: Bills | ((u: Bills) => Bills)) => void;
  coins: Coins;
  setCoins: (t: Coins | ((u: Coins) => Coins)) => void;
};

export const M4S2Context = createContext<M4S2Content>({
  mode: "",
  setMode: (t: string) => {},
  report: defaultReport,
  setReport: (t: Report | ((u: Report) => Report)) => {},
  bills: defaultBills,
  setBills: (t: Bills | ((u: Bills) => Bills)) => {},
  coins: defaultCoins,
  setCoins: (t: Coins | ((u: Coins) => Coins)) => {},
});

export type M4S3Content = {};

export const M4S3Context = createContext<M4S3Content>({});

export type M4S4Content = {};

export const M4S4Context = createContext<M4S4Content>({});
