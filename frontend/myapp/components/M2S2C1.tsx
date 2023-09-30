import { useCallback, useContext, useEffect, useState } from "react";
import { Text } from "react-native";
import { defaultExpense } from "../constants/constants";
import {
  CategoryInterface,
  Expense,
  M2S2Context,
  MainContext,
} from "../constants/interfaces";
import { useStore } from "../stores/Store";
import { EditExpenseModal } from "./M2P1";
import { LoanHistoryItems } from "./M2S2G1";
import { ExpenseCategorySelector } from "./M2P2";

export const ReceivablesView = (props: { visible: boolean }) => {
  const { categoryStore, transactionStore } = useStore();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expense, setExpense] = useState(defaultExpense);
  const [popup, setPopup] = useState("");
  const [categories, setCategories] = useState<CategoryInterface[]>([]);
  const [category, setCategory] = useState("-1");

  const { currentScreen } = useContext(MainContext);

  const getCategories = useCallback(async () => {
    const excludeTitles = ["Stocks/Parts", "Return of Sale Items", "Dollars"];
    await categoryStore.fetchCategories();
    setCategories(
      categoryStore.categories.filter(
        (s) => s.nature === "1" && !excludeTitles.includes(s.title)
      )
    );
    setCategory(categoryStore.categoryId("Lend Money") ?? "-1");
  }, []);

  const getTransactions = useCallback(async () => {
    await transactionStore.fetchTransactions(
      `expenses/?cat=${categoryStore.categoryName(category)}`
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
  }, [categories, category]);

  const setValue = (t: any) => {
    setCategory(t);
  };

  const values = {
    expense: expense,
    setExpense: setExpense,
    expenses: expenses,
    setExpenses: setExpenses,
    popup: popup,
    setPopup: setPopup,
  };

  useEffect(() => {
    getCategories();
  }, [props.visible, currentScreen]);

  useEffect(() => {
    if (props.visible && currentScreen === "Expenses") {
      transactionStore.deleteTransactionHistory();
      getTransactions();
    }
  }, [props.visible, currentScreen, category]);

  return (
    props.visible && (
      <M2S2Context.Provider value={values}>
        <EditExpenseModal
          expense={expense}
          setExpenses={setExpenses}
          popup={popup}
          setPopup={setPopup}
        />
        <ExpenseCategorySelector
          categories={categories}
          setValue={setValue}
          categoryId={category}
        />
        <LoanHistoryItems />
      </M2S2Context.Provider>
    )
  );
};
