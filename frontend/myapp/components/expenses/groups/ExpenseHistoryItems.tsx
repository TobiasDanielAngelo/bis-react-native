import { ScrollView, StyleSheet, Text } from "react-native";
import { Expenses } from "../../../constants/interfaces";
import { ExpenseHistoryItem } from "../units/ExpenseHistoryItem";

export const ExpenseHistoryItems = (props: { expenses: Expenses[] }) => {
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
