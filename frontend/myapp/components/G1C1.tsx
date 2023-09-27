import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";
import { useCallback, useEffect, useMemo, useState } from "react";
import { defaultUser } from "../constants/constants";
import { MainContext, User } from "../constants/interfaces";
import { useStore } from "../stores/Store";
import { Drawer } from "./G1G1";
import { DrawerActions } from "./G1U1";
import { SalesModule } from "./M1C1";
import { ExpensesModule } from "./M2C1";

export const HomeView = () => {
  const [currentUser, setCurrentUser] = useState<User>();
  const { categoryStore } = useStore();
  const [latest, setLatest] = useState({
    key: "",
    type: "",
  });

  const retrieveCurrentUser = async () => {
    setCurrentUser(
      JSON.parse((await AsyncStorage.getItem("@currentUser")) ?? "")
    );
  };

  const myFocusScreen = useMemo(() => "Expenses", []);

  const getCategories = useCallback(async () => {
    await categoryStore.fetchCategories();
  }, []);

  useEffect(() => {
    retrieveCurrentUser();
    getCategories();
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
        </Drawer.Navigator>
      </NavigationContainer>
    </MainContext.Provider>
  );
};
