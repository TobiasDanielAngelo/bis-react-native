import { observer } from "mobx-react-lite";
import { useState } from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import { QuickExpenseView } from "./M2S1C1";
import { ReviewView } from "./M2S3C1";
import { MenuBar } from "./M2G1";

export const ExpensesModule = observer(({ navigation }: any) => {
  const [view, setView] = useState("quick");

  return (
    <SafeAreaView style={styles.all}>
      <View style={styles.body}>
        <QuickExpenseView visible={view === "quick"} />
        <ReviewView visible={view === "view"} />
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
    backgroundColor: "lightcyan",
  },
});
