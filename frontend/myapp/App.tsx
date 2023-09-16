import * as React from "react";
import {
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
  createDrawerNavigator,
} from "@react-navigation/drawer";
import { NavigationContainer } from "@react-navigation/native";
import { SalesModule } from "./containers/SalesModule";
import { AppRegistry, StyleSheet, View, Text, Button } from "react-native";
import { createStore, StoreContext, useStore } from "./stores/Store";
import {
  Link,
  NativeRouter,
  Route,
  Routes,
  useNavigate,
} from "react-router-native";
import { LoginView } from "./containers/LoginView";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MainContext, User, defaultUser } from "./interfaces/interfaces";
import { ExpensesModule } from "./containers/ExpensesModule";

const Drawer = createDrawerNavigator();

function HomeScreen() {
  return <View></View>;
}
function CustomDrawerContent(props: any) {
  const navigate = useNavigate();

  const { userStore } = useStore();

  const logoutUser = async () => {
    const response = await userStore.logoutUser();
    if (!response.ok) {
      return;
    }
    navigate("/login");
  };

  return (
    <DrawerContentScrollView>
      <DrawerItemList {...props} />
      <DrawerItem label="Logout" onPress={logoutUser} />
    </DrawerContentScrollView>
  );
}

const HomeView = () => {
  const [currentUser, setCurrentUser] = useState<User>();

  const retrieveCurrentUser = async () => {
    setCurrentUser(
      JSON.parse((await AsyncStorage.getItem("@currentUser")) ?? "")
    );
  };

  useEffect(() => {
    retrieveCurrentUser();
  }, []);

  useEffect(() => {
    console.log(currentUser);
  }, [currentUser]);

  return (
    <MainContext.Provider
      value={{
        currentUser: currentUser ?? defaultUser,
      }}
    >
      <NavigationContainer>
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
          drawerContent={(props) => <CustomDrawerContent {...props} />}
        >
          <Drawer.Screen name="Home" component={HomeScreen} />
          <Drawer.Screen name="Sales" component={SalesModule} />
          {currentUser?.privilege !== "3" && (
            <Drawer.Screen name="Expenses" component={ExpensesModule} />
          )}
        </Drawer.Navigator>
      </NavigationContainer>
    </MainContext.Provider>
  );
};

export default function App() {
  const store = createStore();

  return (
    <>
      <StoreContext.Provider value={store}>
        <NativeRouter>
          <Routes>
            <Route path="/" element={<LoginView />} />
            <Route path="/login" element={<LoginView />} />
            <Route path="/home" element={<HomeView />} />
          </Routes>
        </NativeRouter>
      </StoreContext.Provider>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgb(208,224,227)",
    alignItems: "center",
    justifyContent: "center",
  },
});
