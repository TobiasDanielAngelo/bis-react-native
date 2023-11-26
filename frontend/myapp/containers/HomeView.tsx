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

  const getParts = useCallback(() => {
    sparePartStore.fetchAll();
  }, []);

  const getProductRange = useCallback(async () => {
    const resp = await productStore.fetchProductRangeIds();
    if (!resp.ok || !resp.data) return;
    for (let i = resp.data.min_id; i <= resp.data.max_id; i += 40) {
      await productStore.fetchProductsByIds(arrayRange(i, i + 40));
    }
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
    getAccounts();
    getMechanics();
    getParts();
    getCategories();
    getMotors();
    // getProductRange();
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
        <Drawer.Screen name="Sales" component={SalesModule} />
        <Drawer.Screen name="Expenses" component={ExpenseModule} />
        <Drawer.Screen name="Inventory" component={InventoryModule} />
        <Drawer.Screen name="Finance" component={FinanceModule} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
});
