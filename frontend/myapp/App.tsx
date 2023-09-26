import * as React from "react";
import { StyleSheet } from "react-native";
import { NativeRouter, Route, Routes } from "react-router-native";
import { HomeView } from "./components/G1C1";
import { LoginView } from "./components/G0C1";
import { StoreContext, createStore } from "./stores/Store";
import { DummyView } from "./components/G3C1";

export default function App() {
  const store = createStore();

  const dummy = false;

  return dummy ? (
    <DummyView />
  ) : (
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

const styles = StyleSheet.create({});
