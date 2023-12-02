import { observer } from "mobx-react-lite";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { ModesBar } from "../blueprints/ModesBar";
import { AnalyticsList } from "../components/AnalyticsList";
import { BalancingForm } from "../components/BalancingForm";
import { defaultBills, defaultCoins } from "../constants/constants";

export const A5BalanceView = observer((props: { isVisible?: boolean }) => {
  const { isVisible } = props;

  const [mode, setMode] = useState(0);
  const [bills, setBills] = useState(defaultBills);
  const [coins, setCoins] = useState(defaultCoins);

  const onPressClear = () => {
    setBills(defaultBills);
    setCoins(defaultCoins);
  };

  return (
    isVisible && (
      <View style={styles.main}>
        <ModesBar
          actions={[
            { id: 1, name: "payments", label: "Petty Cash" },
            { id: 2, name: "compare", label: "Tally" },
            { id: 3, name: "description", label: "Remit" },
            { id: 4, name: "analytics", label: "Analytics" },
          ]}
          mode={mode}
          setMode={setMode}
          onPressClear={onPressClear}
        />
        <View style={styles.body}>
          <BalancingForm
            mode={mode}
            hidden={mode === 4 || mode === 0}
            bills={bills}
            coins={coins}
            setBills={setBills}
            setCoins={setCoins}
          />
          <AnalyticsList hidden={mode !== 4} />
        </View>
      </View>
    )
  );
});

const styles = StyleSheet.create({
  main: {
    flex: 1,
  },
  body: {
    flex: 1,
    margin: 3,
  },
  bar: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
});
