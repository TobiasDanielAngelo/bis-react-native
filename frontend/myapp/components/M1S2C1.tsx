import { useCallback, useContext, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { defaultLaborItem } from "../constants/constants";
import { Icon, Text } from "react-native-elements";
import {
  CustomerLabor,
  CustomerLaborItem,
  M1S2Context,
  MainContext,
  MechanicInterface,
} from "../constants/interfaces";
import { useStore } from "../stores/Store";
import { LoadingView } from "./G2C1";
import { RedeemList } from "./M1S2G1";
import { MechanicList } from "./M1S2G2";
import { StatusBar } from "./M1S2S1";
import moment from "moment";
import { DateSelector } from "./M1S2U2";

export const RedeemView = (props: { visible: boolean }) => {
  const { currentScreen } = useContext(MainContext);
  const { transactionStore, categoryStore, mechanicStore } = useStore();
  const [customers, setCustomers] = useState<CustomerLabor[]>([]);
  const [laborer, setLaborer] = useState("");
  const [laborItem, setLaborItem] = useState(defaultLaborItem);
  const [laborItems, setLaborItems] = useState<CustomerLaborItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(new Date());
  const [mechanics, setMechanics] = useState<MechanicInterface[]>([]);

  const getCategories = useCallback(async () => {
    await categoryStore.fetchCategories();
  }, []);

  const getMechanics = useCallback(async () => {
    setLoading(true);
    await mechanicStore.fetchMechanics();
    setMechanics(mechanicStore.mechanics);
  }, []);

  const getTransactions = useCallback(async () => {
    transactionStore.deleteTransactionHistory();
    setLoading(true);
    try {
      await transactionStore.fetchTransactions(
        `sales/?date=${moment(date).format("YYYYMMDD")}`
      );

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
          discountSales: parseFloat(descDetails[5]) as number,
          amountPaidGCash: parseFloat(descDetails[6]) as number,
          toPrint: descDetails[2] === "Print",
          isClosed: descDetails[3] === "Close",
          dateTransacted: s.datetime_transacted,
        };
      });

      setCustomers(customerTransaction);

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
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  }, [date]);

  const values = {
    customers: customers,
    laborer: laborer,
    laborers: mechanics,
    laborItem: laborItem,
    laborItems: laborItems,
    setLaborer: setLaborer,
    setLaborItem: setLaborItem,
    setLaborItems: setLaborItems,
  };

  useEffect(() => {
    getCategories();
    if (props.visible && currentScreen === "Sales") {
      setLaborer("");
      transactionStore.deleteTransactionHistory();
      getTransactions();
      getMechanics();
    }
  }, [props.visible, currentScreen, date]);

  return (
    props.visible &&
    (loading ? (
      <LoadingView />
    ) : (
      <M1S2Context.Provider value={values}>
        <DateSelector date={date} setDate={setDate} />
        <MechanicList />
        <RedeemList />
        <StatusBar />
      </M1S2Context.Provider>
    ))
  );
};

const styles = StyleSheet.create({});
