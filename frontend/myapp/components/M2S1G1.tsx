import { ScrollView, StyleSheet, Text } from "react-native";
import { Expense } from "../constants/interfaces";
import { ExpenseHistoryItem } from "./M2S1U1";

export const ExpenseHistoryItems = (props: { expenses: Expense[] }) => {
  return (
    <ScrollView style={styles.expenseTable}>
      <Text style={{ fontSize: 20, margin: 10 }}>History</Text>

      {props.expenses
        .sort((a, b) => b.id - a.id)
        .map((s) => (
          <ExpenseHistoryItem expense={s} key={`expense-${s.id}`} />
        ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  expenseTable: {
    height: 100,
  },
});
