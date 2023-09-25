import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";
import { useEffect, useState, useCallback } from "react";
import { DrawerActions } from "../../components/general/DrawerActions";
import { MainContext, User, defaultUser } from "../../constants/interfaces";
import { ExpensesModule } from "../expenses/ExpensesModule";
import { SalesModule } from "../sales/SalesModule";
import { Drawer } from "../../components/general/MyDrawer";
import { useStore } from "../../stores/Store";

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
            : "Sales",
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
          initialRouteName="Sales"
          screenOptions={{
            headerShown: false,
            headerStyle: {
              height: 60,
              backgroundColor: "rgb(208,224,227)",
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
