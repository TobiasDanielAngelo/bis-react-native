import { createDrawerNavigator } from "@react-navigation/drawer";
import { NavigationContainer } from "@react-navigation/native";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useState } from "react";
import { DrawerActions } from "../components/MyDrawerActions";
import { useStore } from "../stores/Store";
import { SalesModule } from "./A0SalesModule";
import { ExpenseModule } from "./B0ExpenseModule";
import { InventoryModule } from "./C0InventoryModule";
import { FinanceModule } from "./D0FinanceModule";
import NetInfo, { NetInfoState } from "@react-native-community/netinfo";
import { NetworkStatusPopup } from "../components/NetworkStatusPopup";

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
    userStore,
  } = useStore();

  const [connectionStatus, setConnectionStatus] = useState(false);
  const [connectionType, setConnectionType] = useState<string>("");

  const handleNetworkChange = (state: NetInfoState) => {
    setConnectionStatus(state.isConnected ?? false);
    setConnectionType(state.type);
  };

  const hasAdminStatus = userStore.currentUser.privilege === "1";
  const hasModStatus =
    userStore.currentUser.privilege === "2" ||
    userStore.currentUser.privilege === "1";

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
    mechanicStore.fetchAll({ isActive: true });
  }, []);

  const getCategories = useCallback(() => {
    categoryStore.fetchAll();
  }, []);

  const getMotors = useCallback(() => {
    motorStore.fetchAll();
  }, []);

  useEffect(() => {
    getProducts();
    getAccounts();
    getMechanics();
    getParts();
    getCategories();
    getMotors();
  }, []);

  useEffect(() => {
    const netInfoSubscription = NetInfo.addEventListener(handleNetworkChange);
    return () => {
      netInfoSubscription && netInfoSubscription();
    };
  }, []);

  return (
    <NavigationContainer>
      <NetworkStatusPopup status={connectionStatus} type={connectionType} />
      <Drawer.Navigator
        initialRouteName={myFocusScreen}
        screenOptions={{
          headerShown: false,
        }}
        drawerContent={(props) => <DrawerActions {...props} />}
      >
        <Drawer.Screen name="Sales & Balance" component={SalesModule} />
        {hasModStatus && (
          <Drawer.Screen name="Receipts & Payments" component={ExpenseModule} />
        )}
        <Drawer.Screen
          name="Purchases & Inventory"
          component={InventoryModule}
        />
        {hasAdminStatus && (
          <Drawer.Screen name="Transfers & Trends" component={FinanceModule} />
        )}
      </Drawer.Navigator>
    </NavigationContainer>
  );
});
