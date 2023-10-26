import { observer } from "mobx-react-lite";
import { useState, useEffect, useCallback } from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import { MenuBar } from "./M4G1";
import { ProductsView } from "./M3S2C1";
import { useStore } from "../stores/Store";
import { OrderView } from "./M3S1C1";
import {
  FinanceContext,
  InventoryContext,
  ProductInterface,
} from "../constants/interfaces";
import {
  defaultProduct,
  defaultProductInterface,
} from "../constants/constants";
import { DeliveryView } from "./M3S3C1";
import { CheckView } from "./M3S4C1";
import { ReviewView } from "./M3S5C1";
import { TransferView } from "./M4S1C1";
import { ReportView } from "./M4S2C1";
import { TimelineView } from "./M4S3C1";
import { ForecastView } from "./M4S5C1";
import { AccountsView } from "./M4S4C1";

export const FinanceModule = observer(({ navigation }: any) => {
  const [view, setView] = useState("report");
  const [mode, setMode] = useState("end");

  const values = {
    view: view,
    setView: setView,
    mode: mode,
    setMode: setMode,
  };

  return (
    <FinanceContext.Provider value={values}>
      <SafeAreaView style={styles.all}>
        <View style={styles.body}>
          <TransferView visible={view === "transfer"} />
          <ReportView visible={view === "report"} />
          <AccountsView visible={view === "accounts"} />
          <TimelineView visible={view === "timeline"} />
          <ForecastView visible={view === "forecast"} />
        </View>
        <MenuBar view={view} setView={setView} />
      </SafeAreaView>
    </FinanceContext.Provider>
  );
});

const styles = StyleSheet.create({
  all: {
    flex: 1,
  },
  body: {
    flex: 1,
    justifyContent: "flex-end",
    paddingTop: 25,
    backgroundColor: "lightcyan",
  },
});
