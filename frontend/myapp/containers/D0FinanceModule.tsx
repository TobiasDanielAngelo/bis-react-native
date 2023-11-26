import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { MenuBar } from "../blueprints/MenuBar";
import { addDays } from "../constants/helpers";
import { useStore } from "../stores/Store";
import { BlankView } from "./BlankView";
import { D1TransferView } from "./D1TransferView";
import { D3TimelineView } from "./D3TimelineView";
import { D4AccountsView } from "./D4AccountsView";
import { D5ForecastView } from "./D5ForecastView";

const defaultLogo = { id: -1, name: "", label: "" };

const submodules = [
  { id: 1, name: "sync-alt", label: "Transfer" },
  { id: 3, name: "timeline", label: "Timeline" },
  { id: 4, name: "account-balance", label: "Accounts" },
  { id: 5, name: "analytics", label: "Forecast" },
];

export const FinanceModule = observer(() => {
  const [view, setView] = useState(defaultLogo);

  const { transactionStore } = useStore();

  const getTransfersToday = () => {
    transactionStore.fetchAll({
      startDate: addDays(new Date(), -1).toISOString(),
      endDate: addDays(new Date(), 1).toISOString(),
      category: 48,
    });
  };
  useEffect(() => {
    getTransfersToday();
  }, []);

  return (
    <View style={styles.main}>
      <BlankView isVisible={view?.id === -1} />
      <D1TransferView isVisible={view?.id === 1} />
      <D3TimelineView isVisible={view?.id === 3} />
      <D4AccountsView isVisible={view?.id === 4} />
      <D5ForecastView isVisible={view?.id === 5} />
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
