import { ScrollView, StyleSheet, Text, FlatList } from "react-native";
import { Expense, M2S2Context } from "../constants/interfaces";
import { LoanHistoryItem } from "./M2S2U1";
import { useContext } from "react";
import moment from "moment";
import { addDays } from "../constants/helpers";

export const LoanHistoryItems = () => {
  const { expenses } = useContext(M2S2Context);

  return (
    <>
      <FlatList
        style={styles.expenseTable}
        data={expenses.sort((a, b) => b.id - a.id)}
        renderItem={({ item }) => <LoanHistoryItem expense={item} />}
      />
    </>
  );
};

const styles = StyleSheet.create({
  expenseTable: {
    height: 100,
  },
});
