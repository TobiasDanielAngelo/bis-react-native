import { createContext, useContext } from "react";
import { CategoryStore, categoryStore } from "./CategoryStore";
import { MechanicStore, mechanicStore } from "./MechanicStore";
import { MotorStore, motorStore } from "./MotorStore";
import { ParticularPOSStore, particularPOSStore } from "./ParticularPOSStore";
import { ProductStore, productStore } from "./ProductStore";
import { SparePartStore, sparePartStore } from "./SparePartStore";
import { TransactionStore, transactionStore } from "./TransactionStore";
import { UserStore, userStore } from "./UserStore";
import {
  ParticularPurchaseStore,
  particularPurchaseStore,
} from "./ParticularPurchaseStore";

class Store {
  userStore: UserStore;
  motorStore: MotorStore;
  productStore: ProductStore;
  sparePartStore: SparePartStore;
  mechanicStore: MechanicStore;
  transactionStore: TransactionStore;
  categoryStore: CategoryStore;
  particularPOSStore: ParticularPOSStore;
  particularPurchaseStore: ParticularPurchaseStore;

  constructor() {
    this.userStore = userStore;
    this.motorStore = motorStore;
    this.productStore = productStore;
    this.sparePartStore = sparePartStore;
    this.mechanicStore = mechanicStore;
    this.transactionStore = transactionStore;
    this.categoryStore = categoryStore;
    this.particularPOSStore = particularPOSStore;
    this.particularPurchaseStore = particularPurchaseStore;
  }
}

export const createStore = () => {
  const store = new Store();
  return store;
};

export const StoreContext = createContext<Store>(createStore());

export const useStore = () => useContext(StoreContext);
