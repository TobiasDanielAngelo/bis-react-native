import { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";
import { MenuBar } from "../blueprints/MenuBar";
import { A1TransactView } from "./A1TransactView";
import { A2CompensateView } from "./A2CompensateView";
import { A3ReturnView } from "./A3ReturnView";
import { A4ReviewView } from "./A4ReviewView";
import { BlankView } from "./BlankView";
import { observer } from "mobx-react-lite";
import { A5BalanceView } from "./A5BalanceView";

const defaultLogo = { id: -1, name: "", label: "" };

const submodules = [
  { id: 1, name: "point-of-sale", label: "Transact" },
  { id: 2, name: "home-repair-service", label: "Settle" },
  { id: 3, name: "assignment-return", label: "Return" },
  { id: 4, name: "history", label: "History" },
  { id: 5, name: "description", label: "Balance" },
];

export const SalesModule = observer(() => {
  const [view, setView] = useState(defaultLogo);

  const onPressItem = useCallback(
    (item: { id: number; name: string; label: string }) => {
      setView((prev) => (prev.id === item.id ? defaultLogo : item));
    },
    [view]
  );

  return (
    <View style={styles.main}>
      <BlankView isVisible={view?.id === -1} />
      <A1TransactView isVisible={view?.id === 1} />
      <A2CompensateView isVisible={view?.id === 2} />
      <A3ReturnView isVisible={view?.id === 3} />
      <A4ReviewView isVisible={view?.id === 4} />
      <A5BalanceView isVisible={view?.id === 5} />
      <MenuBar
        items={submodules}
        selectedItem={view}
        onPressItem={onPressItem}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  main: {
    backgroundColor: "lightcyan",
    flex: 1,
  },
});
