import { createContext, useContext } from "react";
import { AccountStore, accountStore } from "./AccountStore";
import { CategoryStore, categoryStore } from "./CategoryStore";
import { CountItemStore, countItemStore } from "./CountItemStore";
import { MechanicStore, mechanicStore } from "./MechanicStore";
import { MotorStore, motorStore } from "./MotorStore";
import { PayableStore, payableStore } from "./PayableStore";
import { ProductStore, productStore } from "./ProductStore";
import { PurchaseStore, purchaseStore } from "./PurchaseStore";
import { ReceivableStore, receivableStore } from "./ReceivableStore";
import { SalesItemStore, salesItemStore } from "./SalesItemStore";
import { SaleStore, saleStore } from "./SalesStore";
import { SparePartStore, sparePartStore } from "./SparePartStore";
import { TransactionStore, transactionStore } from "./TransactionStore";
import { UserStore, userStore } from "./UserStore";
import { LaborItemStore, laborItemStore } from "./LaborItemStore";
import { ReturnedItemStore, returnedItemStore } from "./ReturnedItemStore";
import { PurchaseItemStore, purchaseItemStore } from "./PurchaseItemStore";

class Store {
  userStore: UserStore;
  motorStore: MotorStore;
  productStore: ProductStore;
  sparePartStore: SparePartStore;
  mechanicStore: MechanicStore;
  transactionStore: TransactionStore;
  categoryStore: CategoryStore;
  accountStore: AccountStore;
  saleStore: SaleStore;
  salesItemStore: SalesItemStore;
  laborItemStore: LaborItemStore;
  purchaseItemStore: PurchaseItemStore;
  returnedItemStore: ReturnedItemStore;
  payableStore: PayableStore;
  receivableStore: ReceivableStore;
  purchaseStore: PurchaseStore;
  countItemStore: CountItemStore;

  constructor() {
    this.userStore = userStore;
    this.motorStore = motorStore;
    this.productStore = productStore;
    this.sparePartStore = sparePartStore;
    this.mechanicStore = mechanicStore;
    this.transactionStore = transactionStore;
    this.categoryStore = categoryStore;
    this.accountStore = accountStore;
    this.saleStore = saleStore;
    this.salesItemStore = salesItemStore;
    this.laborItemStore = laborItemStore;
    this.returnedItemStore = returnedItemStore;
    this.purchaseItemStore = purchaseItemStore;
    this.payableStore = payableStore;
    this.receivableStore = receivableStore;
    this.purchaseStore = purchaseStore;
    this.countItemStore = countItemStore;
  }
}

export const createStore = () => {
  const store = new Store();
  return store;
};

export const StoreContext = createContext<Store>(createStore());

export const useStore = () => useContext(StoreContext);
