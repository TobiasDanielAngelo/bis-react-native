import { ScrollView, StyleSheet, Text } from "react-native";
import { Expense, M2S2Context } from "../constants/interfaces";
import { LoanHistoryItem } from "./M2S2U1";
import { useContext } from "react";

export const LoanHistoryItems = () => {
  const { expenses } = useContext(M2S2Context);

  return (
    <ScrollView style={styles.expenseTable}>
      {expenses
        .sort((a, b) => b.id - a.id)
        .map((s) => (
          <LoanHistoryItem expense={s} key={`expense-${s.id}`} />
        ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  expenseTable: {
    height: 100,
  },
});
