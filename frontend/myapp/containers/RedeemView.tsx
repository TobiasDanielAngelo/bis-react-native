import { ScrollView, StyleSheet } from "react-native";
import { useCallback, useEffect, useState } from "react";
import {
  CustomerLabor,
  CustomerLaborItem,
  RedeemContext,
} from "../interfaces/interfaces";
import { useStore } from "../stores/Store";
import {
  TransactionItemInterface,
  TransactionUpdateInterface,
} from "../stores/TransactionStore";
import { defaultLaborItem } from "./POSView";
import { laborDueToMechanic } from "../components/SalesComponents/PaymentValidationOverlay";
import { LaborerQueueBar } from "../components/SalesComponents/LaborerQueueBar";
import { MechanicLaborItems } from "../components/SalesComponents/MechanicLaborItems";
import { StatusRedeemBar } from "../components/SalesComponents/StatusRedeemBar";

export const RedeemView = (props: any) => {
  const [laborItems, setLaborItems] = useState<CustomerLaborItem[]>([]);
  const [laborItem, setLaborItem] = useState(-1);
  const [customers, setCustomers] = useState<CustomerLabor[]>([]);
  const [laborer, setLaborer] = useState("");
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

  const { categoryStore, transactionStore } = useStore();

  const getCategories = useCallback(async () => {
    await categoryStore.fetchCategories();
  }, []);

  const getTransactions = useCallback(async () => {
    try {
      // setLoading(true);
      await transactionStore.fetchTransactions("incomes");
      const POSTransactions = transactionStore.transactions.filter(
        (s) => s.category === categoryStore.categoryId("Point of Sales")
      );

      const customerTransaction = POSTransactions.map((s) => {
        const descDetails = s.description.split(", ");
        return {
          id: parseInt(s.pk),
          name: s.transmitter,
          paid: descDetails[1].toLowerCase() as
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
        .filter((v) => v.part.description.includes("Labor"))
        .map((u) => {
          return {
            id: parseInt(u.part.id ?? "-1"),
            custId: parseInt(u.id),
            laborer: u.part.remarks.split(" ")[0],
            description: u.part.description,
            cost: u.part.unit_amount,
            collected: parseInt(u.part.remarks.split(" ")[1]),
          };
        });

      setLaborItems(particularLaborItems);
      // setLoading(false);
    } catch (error) {
      // setLoading(false);
      console.error(error);
    }
  }, []);

  const deleteTransactionHistory = () => {
    transactionStore.deleteTransactionHistory();
  };

  const handleGiven = async (
    description: string,
    collected: number,
    customer: number
  ) => {
    let particulars =
      transactionStore.transactionDetails(`${customer}`)
        ?.particular_transaction ?? [];

    const modifiedParticulars = JSON.parse(JSON.stringify(particulars)).map(
      (s: TransactionItemInterface) => {
        if ((s.description ?? "-1") === description) {
          let remarks = s.remarks.split(" ");
          remarks[1] = `${collected}`;
          s.remarks = remarks.join(" ");
        }
        return s;
      }
    );

    await transactionStore.updateTransaction(`${customer}`, {
      particular_transaction: modifiedParticulars,
    } as TransactionUpdateInterface);

    setLaborItems((prev: CustomerLaborItem[]) => {
      (
        prev.find(
          (s) => s.custId === customer && s.description === description
        ) ?? defaultLaborItem
      ).collected = collected;
      return [...prev];
    });
  };

  useEffect(() => {
    if (props.visible) {
      getCategories();
    }
  }, [props.visible]);

  useEffect(() => {
    if (props.visible) {
      deleteTransactionHistory();
      getTransactions();
    }
  }, [props.visible]);

  const currentTotalGiven = laborItems
    .filter((s) => s.laborer === laborer)
    .map((s) => s.collected)
    .reduce((a, b) => a + b, 0);
  const currentTotalToGive = laborItems
    .filter((s) => s.laborer === laborer)
    .map((s) =>
      laborDueToMechanic(s.description.split(", ")[1], parseFloat(`${s.cost}`))
    )
    .reduce((a, b) => a + b, 0);

  return (
    props.visible && (
      <RedeemContext.Provider
        value={{
          laborItem: laborItem,
          laborItems: laborItems,
          laborers: mechanics,
          laborer: laborer,
          setLaborer: setLaborer,
          customers: customers,
          handleGiven: handleGiven,
        }}
      >
        <LaborerQueueBar />
        <ScrollView style={styles.laborItems}>
          <MechanicLaborItems />
        </ScrollView>
        <StatusRedeemBar
          currentTotalToGive={currentTotalToGive}
          currentTotalGiven={currentTotalGiven}
        />
      </RedeemContext.Provider>
    )
  );
};

const styles = StyleSheet.create({
  laborItems: {
    backgroundColor: "rgb(208,224,227)",
    marginTop: 10,
  },
});
