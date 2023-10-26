import moment from "moment";
import { useCallback, useContext, useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { defaultExpense } from "../constants/constants";
import { Expense, M2S3Context, MainContext } from "../constants/interfaces";
import { useStore } from "../stores/Store";
import { DateSelector } from "./M1S2U2";
import { ExpenseHistoryItems } from "./M2S3G1";
import { EditExpenseModal } from "./M2P1";

export const ReviewView = (props: { visible: boolean }) => {
  const { categoryStore, transactionStore } = useStore();
  const [date, setDate] = useState(new Date());
  const [popup, setPopup] = useState("");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expense, setExpense] = useState(defaultExpense);

  const { currentScreen } = useContext(MainContext);

  const getTransactions = useCallback(async () => {
    await transactionStore.fetchTransactions(
      `expenses/?date=${moment(date).format("YYYYMMDD")}`
    );

    const ExpenseTransactions = transactionStore.transactions
      .filter((s) => s.category !== categoryStore.categoryId("Purchase Parts"))
      .map((s) => ({
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
  }, [date]);

  const values = {
    expense: expense,
    setExpense: setExpense,
    popup: popup,
    setPopup: setPopup,
  };

  useEffect(() => {
    if (props.visible && currentScreen === "Expenses") {
      transactionStore.deleteTransactionHistory();
      getTransactions();
    }
  }, [props.visible, currentScreen, date]);

  return (
    props.visible && (
      <M2S3Context.Provider value={values}>
        <EditExpenseModal
          expense={expense}
          setExpenses={setExpenses}
          popup={popup}
          setPopup={setPopup}
        />
        <DateSelector date={date} setDate={setDate} />
        <ExpenseHistoryItems expenses={expenses} />
      </M2S3Context.Provider>
    )
  );
};

const styles = StyleSheet.create({
  historyBtn: {
    width: 200,
    height: 30,
    borderRadius: 25,
    borderColor: "gray",
    backgroundColor: "teal",
  },
});
