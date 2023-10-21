import { useEffect, useState } from "react";
import { View } from "react-native";
import { InventoryHistory, M3S5Context } from "../constants/interfaces";
import { useStore } from "../stores/Store";
import { HistoryBar } from "./M3S5G1";
import { InventoryHistoryItem } from "./M3S5U1";
import { defaultInventoryHistory } from "../constants/constants";

export const ReviewView = (props: { visible: boolean }) => {
  const { transactionStore } = useStore();
  const [date, setDate] = useState(202310);

  const [transactions, setTransactions] = useState<InventoryHistory[]>([]);
  const [transaction, setTransaction] = useState(-1);

  const getItemizationsByDate = async () => {
    const resp = await transactionStore.fetchTransactions(
      `transactions/?inventory=1&date=${date}`
    );

    setTransactions(
      resp.data?.map((s) => ({
        id: parseInt(s.pk ?? "-1"),
        type: s.description.includes("IC #")
          ? "count"
          : s.description.includes("ORD #")
          ? "purchase"
          : "",
        particulars: s.particular_transaction ?? [],
        receiver: s.receiver,
        encoder: s.encoder,
        dateTransacted: s.datetime_transacted,
        dueDate: s.description.includes("ORD #")
          ? s.description.split(", ")[4]
          : "",
        checkNum: s.description.includes("ORD #")
          ? s.description.split(", ")[3]
          : "",
      })) ?? []
    );
  };

  useEffect(() => {
    getItemizationsByDate();
  }, [date, props.visible]);

  const values = {
    date: date,
    setDate: setDate,
    transactions: transactions,
    transaction: transaction,
    setTransactions: setTransactions,
    setTransaction: setTransaction,
  };

  return (
    props.visible && (
      <M3S5Context.Provider value={values}>
        <HistoryBar />
        <InventoryHistoryItem
          transaction={
            transactions.find((s) => s.id === transaction) ??
            defaultInventoryHistory
          }
        />
      </M3S5Context.Provider>
    )
  );
};
