import * as React from "react";
import { StatusBar, StyleSheet, View } from "react-native";
import { NativeRouter, Route, Routes } from "react-router-native";
import { LoginView } from "./containers/LoginView";
import { HomeView } from "./containers/HomeView";
import { StoreContext, createStore } from "./stores/Store";
import NetInfo from "@react-native-community/netinfo";

export default function App() {
  const store = createStore();

  React.useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      console.log(state);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <View style={styles.main}>
      <StoreContext.Provider value={store}>
        <NativeRouter>
          <Routes>
            <Route path="/" element={<LoginView />} />
            <Route path="/login" element={<LoginView />} />
            <Route path="/home" element={<HomeView />} />
          </Routes>
        </NativeRouter>
      </StoreContext.Provider>
    </View>
  );
}

const styles = StyleSheet.create({
  main: {
    paddingTop: StatusBar.currentHeight,
    justifyContent: "space-between",
    flex: 1,
    backgroundColor: "lightcyan",
  },
});
