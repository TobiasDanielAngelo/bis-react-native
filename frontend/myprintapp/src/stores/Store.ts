import { createContext, useContext } from "react";
import { productStore, ProductStore } from "./ProductStore";
import { transactionStore, TransactionStore } from "./TransactionStore";
import { userStore, UserStore } from "./UserStore";
import { CategoryStore, categoryStore } from "./CategoryStore";

class Store {
  userStore: UserStore;
  productStore: ProductStore;
  transactionStore: TransactionStore;
  categoryStore: CategoryStore;

  constructor() {
    this.userStore = userStore;
    this.productStore = productStore;
    this.transactionStore = transactionStore;
    this.categoryStore = categoryStore;
  }
}

export const createStore = () => {
  const store = new Store();
  return store;
};

export const StoreContext = createContext<Store>(createStore());

export const useStore = () => useContext(StoreContext);
