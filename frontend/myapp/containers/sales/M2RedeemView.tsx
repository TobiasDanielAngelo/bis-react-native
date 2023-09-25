import { useCallback, useContext, useEffect, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { LaborerQueueBar } from "../../components/sales/bars/LaborerQueueBar";
import { MechanicLaborItems } from "../../components/sales/groups/MechanicLaborItems";
import { StatusRedeemBar } from "../../components/sales/status/StatusRedeemBar";
import { defaultLaborItem } from "../../constants/constants";
import {
  CustomerLabor,
  CustomerLaborItem,
  MainContext,
  RedeemContext,
} from "../../constants/interfaces";
import { useStore } from "../../stores/Store";
import { LoadingView } from "../general/LoadingView";

export const RedeemView = (props: any) => {
  const [laborItems, setLaborItems] = useState<CustomerLaborItem[]>([]);
  const [laborItem, setLaborItem] =
    useState<CustomerLaborItem>(defaultLaborItem);
  const [customers, setCustomers] = useState<CustomerLabor[]>([]);
  const [laborer, setLaborer] = useState("");
  const [loading, setLoading] = useState(false);
  const mechanics = [
    "DATS",
    "Aldo",
    "Reniel",
    "Ping",
    "Jervin",
    "Jomar",
    "Others",
    "",
  ];
  const { currentScreen } = useContext(MainContext);
  const { categoryStore, transactionStore } = useStore();

  const getRedeemables = useCallback(async () => {
    try {
      setLoading(true);
      await transactionStore.fetchTransactions("incomes");
      const POSTransactions = transactionStore.transactions.filter(
        (s) => s.category === categoryStore.categoryId("Point of Sales")
      );

      const customerTransaction = POSTransactions.map((s) => {
        const descDetails = s.description.split(", ");
        return {
          id: parseInt(s.pk),
          name: s.transmitter,
          paymentStatus: descDetails[1].toLowerCase() as
            | "paid"
            | "not paid"
            | "validating",
          amountPaid: parseFloat(descDetails[4]) as number,
          dateTransacted: s.datetime_transacted,
        };
      });

      setCustomers((prev) => customerTransaction);

      const particularLaborItems = POSTransactions.map((s) => {
        return s.particular_transaction.map((t) => {
          return { id: s.pk, part: t };
        });
      })
        .flat(1)
        .filter((v) => v.part.description?.includes("Labor"))
        .map((u) => {
          return {
            id: parseInt(u.part.id ?? "-1"),
            custId: parseInt(u.id),
            laborer: u.part.remarks?.split(" ")[0] ?? "",
            description: u.part.description ?? "",
            cost: u.part.unit_amount ?? 0,
            collected: parseInt(u.part.remarks?.split(" ")[1] ?? "0"),
          };
        });

      setLaborItems(particularLaborItems);
      setLoading(false);
    } catch (error) {
      // setLoading(false);
      console.error(error);
    }
  }, []);

  useEffect(() => {
    if (props.visible && currentScreen === "Sales") {
      transactionStore.deleteTransactionHistory();
      getRedeemables();
    }
  }, [props.visible, currentScreen]);

  return (
    props.visible &&
    (loading ? (
      <LoadingView />
    ) : (
      <RedeemContext.Provider
        value={{
          laborItem: laborItem,
          laborItems: laborItems,
          setLaborItem: setLaborItem,
          setLaborItems: setLaborItems,
          laborers: mechanics,
          laborer: laborer,
          setLaborer: setLaborer,
          customers: customers,
        }}
      >
        <LaborerQueueBar />
        <ScrollView style={styles.laborItems}>
          <MechanicLaborItems />
        </ScrollView>
        <StatusRedeemBar />
      </RedeemContext.Provider>
    ))
  );
};

const styles = StyleSheet.create({
  laborItems: {
    backgroundColor: "rgb(208,224,227)",
    marginTop: 10,
  },
});
