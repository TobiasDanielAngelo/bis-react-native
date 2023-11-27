import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { MenuBar } from "../blueprints/MenuBar";
import { useStore } from "../stores/Store";
import { B1QuickView } from "./B1QuickView";
import { B2CategoryView } from "./B2CategoryView";
import { BlankView } from "./BlankView";

const defaultLogo = { id: -1, name: "", label: "" };

const submodules = [
  { id: 1, name: "flash-on", label: "Create" },
  { id: 2, name: "category", label: "View" },
];

export const ExpenseModule = observer(() => {
  const [view, setView] = useState(defaultLogo);

  const { payableStore, receivableStore } = useStore();

  const getPayables = useCallback(() => {
    payableStore.fetchAll({ isActive: true });
  }, []);

  const getReceivables = useCallback(() => {
    receivableStore.fetchAll({ isActive: true });
  }, []);

  useEffect(() => {
    getPayables();
    getReceivables();
  }, []);

  return (
    <View style={styles.main}>
      <BlankView isVisible={view?.id === -1} />
      <B1QuickView isVisible={view?.id === 1} />
      <B2CategoryView isVisible={view?.id === 2} />
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
