import { createContext, useContext } from "react";
import { CategoryStore, categoryStore } from "./CategoryStore";
import { ProductStore, productStore } from "./ProductStore";
import { TransactionStore, transactionStore } from "./TransactionStore";
import { UserStore, userStore } from "./UserStore";
import { ParticularPOSStore, particularPOSStore } from "./ParticularPOSStore";

class Store {
  userStore: UserStore;
  productStore: ProductStore;
  transactionStore: TransactionStore;
  categoryStore: CategoryStore;
  particularPOSStore: ParticularPOSStore;

  constructor() {
    this.userStore = userStore;
    this.productStore = productStore;
    this.transactionStore = transactionStore;
    this.categoryStore = categoryStore;
    this.particularPOSStore = particularPOSStore;
  }
}

export const createStore = () => {
  const store = new Store();
  return store;
};

export const StoreContext = createContext<Store>(createStore());

export const useStore = () => useContext(StoreContext);
