import DateTimePicker from "@react-native-community/datetimepicker";
import { useCallback, useContext, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Icon } from "react-native-elements";
import { defaultExpense } from "../constants/constants";
import { isEqualDate } from "../constants/helpers";
import { Expense, M2S3Context, MainContext } from "../constants/interfaces";
import { useStore } from "../stores/Store";
import { ExpenseHistoryItems } from "./M2S1G1";
import { EditExpenseModal } from "./M2S1P1";

export const ReviewView = (props: any) => {
  const { categoryStore, transactionStore } = useStore();
  const [date, setDate] = useState(new Date());
  const [popup, setPopup] = useState("");
  const [showDate, setShowDate] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expense, setExpense] = useState(defaultExpense);

  const { currentScreen } = useContext(MainContext);

  const getCategories = useCallback(async () => {
    await categoryStore.fetchCategories();
  }, []);

  const getTransactions = useCallback(async () => {
    await transactionStore.fetchTransactions("expenses/");
    const ExpenseTransactions = transactionStore.transactions
      .map((s) => s.asJson)
      .map((s) => ({
        id: parseInt(s.pk),
        amount: s.particular_transaction
          .map((t) => t.quantity ?? 0 * (t.unit_amount ?? 0))
          .reduce((a, b) => a + b, 0),
        spender: s.receiver,
        remarks: s.description,
        datetimeTransacted: s.datetime_transacted,
        categoryId: categoryStore.categoryName(s.category) ?? "",
        receiptId: -1,
      }));

    setExpenses(ExpenseTransactions);
  }, []);

  const handleChangeDate = (date: Date) => {
    setDate(date);
    setShowDate(false);
  };

  const updateCost = async (cost: number) => {};

  const deleteTransactionHistory = () => {
    transactionStore.deleteTransactionHistory();
  };
  useEffect(() => {
    if (props.visible && currentScreen === "Expenses") {
      getCategories();
      deleteTransactionHistory();
      getTransactions();

      if (true) {
        const interval = setInterval(() => {
          getTransactions();
        }, 10000);
        return () => clearInterval(interval);
      }
    }
  }, [props.visible, currentScreen]);

  return (
    props.visible && (
      <M2S3Context.Provider
        value={{
          expense: expense,
          setExpense: setExpense,
          popup: popup,
          setPopup: setPopup,
        }}
      >
        <EditExpenseModal updateCost={updateCost} />
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "darkslategray",
            paddingVertical: 10,
            flexDirection: "row",
          }}
        >
          <Text
            style={{ fontSize: 30, color: "white" }}
            onPress={() => setShowDate(true)}
          >
            {date.toDateString()}
          </Text>
          <Icon
            name="edit"
            size={35}
            color="white"
            style={{ margin: 10 }}
            onPress={() => setShowDate(true)}
          />
        </View>
        <View
          style={{
            alignItems: "center",
            justifyContent: "flex-start",
            flex: 1,
          }}
        >
          <ExpenseHistoryItems
            expenses={expenses.filter((s) =>
              isEqualDate(s.datetimeTransacted, "")
            )}
          />
        </View>
        {showDate && (
          <DateTimePicker
            mode="date"
            display="calendar"
            value={date}
            maximumDate={new Date()}
            onChange={(_, date) => handleChangeDate(date ?? new Date())}
          />
        )}
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
