import { Text, View, StyleSheet, ScrollView } from "react-native";
import { Expenses } from "../../interfaces/interfaces";
import { winWidth } from "../../constants/Constants";
import { formatDate } from "../../containers/POSView";

export const ExpenseHistoryTable = (props: { expenses: Expenses[] }) => {
  return (
    <>
      <Text style={{ fontSize: 20, textAlign: "left" }}>History</Text>
      <ScrollView style={styles.expenseTable}>
        {props.expenses.map((s) => (
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text>{s.id}</Text>
            <Text>{s.categoryId}</Text>
            <Text>{formatDate(new Date(s.datetimeTransacted))}</Text>
            <Text>{s.spender}</Text>
            <Text>{s.amount}</Text>
          </View>
        ))}
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  expenseTable: {
    width: winWidth * 0.9,
    margin: winWidth * 0.05,
    height: 200,
  },
});
