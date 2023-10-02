import moment from "moment";
import { useCallback, useContext, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  CategoryInterface,
  Expense,
  M2S1Context,
  MainContext,
} from "../constants/interfaces";
import { useStore } from "../stores/Store";
import { QuickExpenseItems } from "./M2S1G1";
import { CreateExpenseForm } from "./M2S1P1";

export const QuickExpenseView = (props: any) => {
  const { categoryStore, transactionStore } = useStore();
  const [viewHistory, setViewHistory] = useState(true);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<CategoryInterface[]>([]);

  const { currentScreen } = useContext(MainContext);

  const getCategories = useCallback(async () => {
    const excludeTitles = ["Stocks/Parts", "Return of Sale Items", "Dollars"];
    await categoryStore.fetchCategories();
    setCategories(
      categoryStore.categories.filter(
        (s) => s.nature === "1" && !excludeTitles.includes(s.title)
      )
    );
  }, []);

  const getTransactions = useCallback(async () => {
    await transactionStore.fetchTransactions(
      `expenses/?date=${moment(new Date()).format("YYYYMMDD")}`
    );

    const ExpenseTransactions = transactionStore.transactions.map((s) => ({
      id: parseInt(s.pk),
      amount: s.particular_transaction
        .map(
          (t) =>
            (t.description?.includes("***Received***") ? -1 : 1) *
            (t.quantity ?? 0) *
            (t.unit_amount ?? 0)
        )
        .reduce((a, b) => a + b, 0),
      spender: s.receiver,
      remarks: s.description,
      datetimeTransacted: s.datetime_transacted,
      categoryId: categoryStore.categoryName(s.category) ?? "",
      receiptId: s.description,
    }));

    setExpenses(ExpenseTransactions);
  }, []);

  const values = {
    categories: categories,
    viewHistory: viewHistory,
    setViewHistory: setViewHistory,
    expenses: expenses,
    setExpenses: setExpenses,
  };

  useEffect(() => {
    getCategories();
  }, []);

  useEffect(() => {
    if (props.visible && currentScreen === "Expenses") {
      transactionStore.deleteTransactionHistory();
      getTransactions();
    }
  }, [props.visible, currentScreen]);

  return (
    props.visible && (
      <M2S1Context.Provider value={values}>
        <View style={styles.main}>
          <CreateExpenseForm />
          {viewHistory && <QuickExpenseItems expenses={expenses} />}
        </View>
      </M2S1Context.Provider>
    )
  );
};

const styles = StyleSheet.create({
  main: {
    alignItems: "center",
    justifyContent: "flex-start",
    flex: 1,
  },
  historyBtn: {
    width: 200,
    height: 30,
    borderRadius: 25,
    borderColor: "gray",
    backgroundColor: "teal",
  },
});
