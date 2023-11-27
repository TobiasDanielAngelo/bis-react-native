import { createDrawerNavigator } from "@react-navigation/drawer";
import { NavigationContainer } from "@react-navigation/native";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect } from "react";
import { DrawerActions } from "../components/MyDrawerActions";
import { useStore } from "../stores/Store";
import { SalesModule } from "./A0SalesModule";
import { ExpenseModule } from "./B0ExpenseModule";
import { InventoryModule } from "./C0InventoryModule";
import { FinanceModule } from "./D0FinanceModule";

const Drawer = createDrawerNavigator();

const myFocusScreen = "Sales";

const arrayRange = (start: number, stop: number) =>
  Array.from({ length: stop - start }, (value, index) => start + index);

export const HomeView = observer((props: {}) => {
  const {
    mechanicStore,
    productStore,
    accountStore,
    sparePartStore,
    categoryStore,
    motorStore,
  } = useStore();

  const getProducts = useCallback(async () => {
    const resp = await productStore.fetchProductRange();
    if (!resp.ok || !resp.data) return;
    for (let i = resp.data.min_id; i <= resp.data.max_id; i += 40) {
      await productStore.fetchProducts({ ids: arrayRange(i, i + 40) });
    }
  }, []);

  const getParts = useCallback(() => {
    sparePartStore.fetchAll();
  }, []);

  const getAccounts = useCallback(() => {
    accountStore.fetchAll();
  }, []);

  const getMechanics = useCallback(() => {
    mechanicStore.fetchMechanics();
  }, []);

  const getCategories = useCallback(() => {
    categoryStore.fetchAll();
  }, []);

  const getMotors = useCallback(() => {
    motorStore.fetchMotors();
  }, []);

  useEffect(() => {
    getProducts();
    getAccounts();
    getMechanics();
    getParts();
    getCategories();
    getMotors();
  }, []);

  return (
    <NavigationContainer>
      <Drawer.Navigator
        initialRouteName={myFocusScreen}
        screenOptions={{
          headerShown: false,
        }}
        drawerContent={(props) => <DrawerActions {...props} />}
      >
        <Drawer.Screen name="Sales & Balance" component={SalesModule} />
        <Drawer.Screen name="Receipts & Payments" component={ExpenseModule} />
        <Drawer.Screen
          name="Purchases & Inventory"
          component={InventoryModule}
        />
        <Drawer.Screen name="Transfers & Trends" component={FinanceModule} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
});
