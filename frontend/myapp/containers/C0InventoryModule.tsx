import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { MenuBar } from "../blueprints/MenuBar";
import { useStore } from "../stores/Store";
import { BlankView } from "./BlankView";
import { C1OrderView } from "./C1OrderView";
import { C2ProductView } from "./C2ProductView";
import { C3DeliveryView } from "./C3DeliveryView";
import { C4CheckView } from "./C4CheckView";
import { C5HistoryView } from "./C5HistoryView";

const defaultLogo = { id: -1, name: "", label: "" };

const submodules = [
  { id: 1, name: "add-shopping-cart", label: "Order" },
  { id: 2, name: "category", label: "Products" },
  { id: 3, name: "local-shipping", label: "Delivery" },
  { id: 4, name: "fact-check", label: "Check" },
  { id: 5, name: "history", label: "History" },
];

export const InventoryModule = observer(() => {
  const [view, setView] = useState(defaultLogo);
  const { purchaseStore, product2Store } = useStore();

  const getPurchases = useCallback(() => {
    purchaseStore.fetchAll({ isActive: true });
  }, []);

  useEffect(() => {
    getPurchases();
  }, []);

  return (
    <View style={styles.main}>
      <BlankView isVisible={view?.id === -1} />
      <C1OrderView isVisible={view?.id === 1} />
      <C2ProductView isVisible={view?.id === 2} />
      <C3DeliveryView isVisible={view?.id === 3} />
      <C4CheckView isVisible={view?.id === 4} />
      <C5HistoryView isVisible={view?.id === 5} />
      <MenuBar items={submodules} selectedItem={view} onPressItem={setView} />
    </View>
  );
});

const styles = StyleSheet.create({
  main: {
    backgroundColor: "lightcyan",
    flex: 1,
  },
});
