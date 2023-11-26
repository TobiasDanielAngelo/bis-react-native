import AsyncStorage from "@react-native-async-storage/async-storage";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { NavigationContainer } from "@react-navigation/native";
import { observer } from "mobx-react-lite";
import { createContext, useCallback, useEffect, useState } from "react";
import { DrawerActions } from "../components/MyDrawerActions";
import { defaultUser } from "../constants/constants";
import { useStore } from "../stores/Store";
import { UserInterface } from "../stores/UserStore";
import { SalesModule } from "./A0SalesModule";
import { ExpenseModule } from "./B0ExpenseModule";
import { InventoryModule } from "./C0InventoryModule";
import { FinanceModule } from "./D0FinanceModule";

const Drawer = createDrawerNavigator();

type MainContent = { currentUser: UserInterface };

const MainContext = createContext<MainContent>({
  currentUser: defaultUser,
});

const myFocusScreen = "Sales";

const arrayRange = (start: number, stop: number) =>
  Array.from({ length: stop - start }, (value, index) => start + index);

export const HomeView = observer((props: {}) => {
  const [currentUser, setCurrentUser] = useState(defaultUser);

  const {
    mechanicStore,
    product2Store,
    accountStore,
    sparePartStore,
    categoryStore,
    motorStore,
  } = useStore();

  const retrieveCurrentUser = async () => {
    setCurrentUser(
      JSON.parse((await AsyncStorage.getItem("@currentUser")) ?? "")
    );
  };

  const getParts = useCallback(() => {
    sparePartStore.fetchSpareParts();
  }, []);

  const getProductRange = useCallback(async () => {
    const resp = await product2Store.fetchProductRangeIds();
    if (!resp.ok || !resp.data) return;
    for (let i = resp.data.min_id; i <= resp.data.max_id; i += 40) {
      await product2Store.fetchProductsByIds(arrayRange(i, i + 40));
    }
  }, []);

  const getAccounts = useCallback(() => {
    accountStore.fetchAccounts();
  }, []);

  const getMechanics = useCallback(() => {
    mechanicStore.fetchMechanics();
  }, []);

  const getCategories = useCallback(() => {
    categoryStore.fetchCategories();
  }, []);

  const getMotors = useCallback(() => {
    motorStore.fetchMotors();
  }, []);

  useEffect(() => {
    retrieveCurrentUser();
    getAccounts();
    getMechanics();
    getParts();
    getCategories();
    getMotors();
    // getProductRange();
  }, []);

  const values = {
    currentUser: currentUser,
  };

  return (
    <MainContext.Provider value={values}>
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
    </MainContext.Provider>
  );
});
