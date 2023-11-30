import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { HView } from "../blueprints/HView";
import { ModesBar } from "../blueprints/ModesBar";
import { MyDatePicker } from "../blueprints/MyDatePicker";
import { MyDropdownPicker } from "../blueprints/MyDropdownPicker";
import { MyForm } from "../blueprints/MyForm";
import { MyIcon } from "../blueprints/MyIcon";
import { MyText } from "../blueprints/MyText";
import { MyTextInput } from "../blueprints/MyTextInput";
import { toNumString, totalValue } from "../constants/helpers";
import { accountStore } from "../stores/AccountStore";
import { useStore } from "../stores/Store";
import { ExpenseForm } from "../components/ExpenseForm";
import { IncomeForm } from "../components/IncomeForm";
import { ReceivableForm } from "../components/ReceivableForm";
import { PayableForm } from "../components/PayableForm";

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
