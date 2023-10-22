import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { defaultUser } from "../constants/constants";
import { MainContext, User } from "../constants/interfaces";
import { Drawer } from "./G1G1";
import { DrawerActions } from "./G1U1";
import { SalesModule } from "./M1C1";
import { ExpensesModule } from "./M2C1";
import { InventoryModule } from "./M3C1";
import { FinanceModule } from "./M4C1";

const myFocusScreen = "Finance";

export const HomeView = () => {
  const [currentUser, setCurrentUser] = useState<User>();
  const [latest, setLatest] = useState({
    key: "",
    type: "",
  });

  const retrieveCurrentUser = async () => {
    setCurrentUser(
      JSON.parse((await AsyncStorage.getItem("@currentUser")) ?? "")
    );
  };

  useEffect(() => {
    retrieveCurrentUser();
  }, []);

  return (
    <MainContext.Provider
      value={{
        currentUser: currentUser ?? defaultUser,
        currentScreen:
          latest.key?.split("-")[0] !== ""
            ? latest.key?.split("-")[0]
            : myFocusScreen,
      }}
    >
      <NavigationContainer
        onStateChange={(state) => {
          setLatest(
            state?.history
              ? (state.history[state.history.length - 1] as {
                  key: string;
                  type: string;
                })
              : {
                  key: "",
                  type: "",
                }
          );
        }}
      >
        <Drawer.Navigator
          initialRouteName={myFocusScreen}
          screenOptions={{
            headerShown: false,
            headerStyle: {
              height: 60,
              backgroundColor: "lightcyan",
            },
            headerTitle: "",
          }}
          drawerContent={(props) => <DrawerActions {...props} />}
        >
          <Drawer.Screen name="Sales" component={SalesModule} />
          {currentUser?.privilege !== "3" && (
            <Drawer.Screen name="Expenses" component={ExpensesModule} />
          )}
          <Drawer.Screen name="Inventory" component={InventoryModule} />
          <Drawer.Screen name="Finance" component={FinanceModule} />
        </Drawer.Navigator>
      </NavigationContainer>
    </MainContext.Provider>
  );
};
