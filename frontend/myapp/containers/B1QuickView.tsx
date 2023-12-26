import { observer } from "mobx-react-lite";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { ModesBar } from "../blueprints/ModesBar";
import { ExpenseForm } from "../components/ExpenseForm";
import { IncomeForm } from "../components/IncomeForm";
import { PayableForm } from "../components/PayableForm";
import { ReceivableForm } from "../components/ReceivableForm";

export const B1QuickView = observer((props: { isVisible?: boolean }) => {
  const { isVisible } = props;
  const [mode, setMode] = useState(0);

  return (
    isVisible && (
      <View style={styles.main}>
        <ModesBar
          actions={[
            { id: 1, name: "add", label: "Expense" },
            { id: 2, name: "request-quote", label: "Receivable" },
            { id: 3, name: "credit-card", label: "Payable" },
            { id: 4, name: "add", label: "Income etc." },
          ]}
          mode={mode}
          setMode={setMode}
        />
        <View style={styles.body}>
          <ExpenseForm hidden={mode !== 1} />
          <ReceivableForm hidden={mode !== 2} />
          <PayableForm hidden={mode !== 3} />
          <IncomeForm hidden={mode !== 4} />
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
  },
});
