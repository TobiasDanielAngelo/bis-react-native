import { StyleSheet, View, Text, SafeAreaView } from "react-native";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { POSView } from "./POSView";
import { RedeemView } from "./RedeemView";
import { RefundView } from "./RefundView";
import { ReviewView } from "./ReviewView";
import { MenuBar } from "../components/ExpenseComponents/MenuBar";
import { QuickExpenseView } from "./QuickExpenseView";

export const ExpensesModule = observer(({ navigation }: any) => {
  const [view, setView] = useState("quick");

  return (
    <SafeAreaView style={styles.all}>
      <View style={styles.body}>
        <QuickExpenseView visible={view === "quick"} />
      </View>
      <MenuBar view={view} setView={setView} />
    </SafeAreaView>
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
    backgroundColor: "honeydew",
  },
});
