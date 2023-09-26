import DateTimePicker from "@react-native-community/datetimepicker";
import { useCallback, useContext, useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Icon } from "react-native-elements";
import { defaultCustomer } from "../constants/constants";
import { isEqualDate } from "../constants/helpers";
import {
  Customer,
  CustomerLaborItem,
  CustomerSalesItem,
  Item,
  M1S4Context,
  MainContext,
} from "../constants/interfaces";
import { useStore } from "../stores/Store";
import { CustomerViewItem } from "./M1S4U1";
import { LoadingView } from "./G2C1";
import { DateSelector } from "./M1S2U2";
import { CustomerViewItems } from "./M1S4G1";
import moment from "moment";

export const ReviewView = (props: any) => {
  const [date, setDate] = useState(new Date());
  const [salesItems, setSalesItems] = useState<CustomerSalesItem[]>([]);
  const [returnItems, setReturnItems] = useState<CustomerSalesItem[]>([]);
  const [laborItems, setLaborItems] = useState<CustomerLaborItem[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customer, setCustomer] = useState(defaultCustomer);
  const [loading, setLoading] = useState(false);

  const { categoryStore, transactionStore } = useStore();
  const { currentScreen } = useContext(MainContext);

  const getTransactions = useCallback(async () => {
    try {
      setLoading(true);
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

      setCustomers((prev) => customerTransaction);

      const particularSalesItems = POSTransactions.map((s) => {
        return s.particular_transaction.map((t) => {
          return { id: s.pk, part: t };
        });
      })
        .flat(1)
        .filter((v) => v.part.description?.includes("SKU"))
        .map((u) => {
          return {
            id: parseInt(u.part.id ?? "-1"),
            itemId: parseInt(
              u.part.description?.split("***")[0].replace("SKU", "") ?? "-1"
            ),
            itemDescription: u.part.description?.split("***")[1] ?? "",
            custId: parseInt(u.id),
            qty: u.part.quantity ?? 0,
            unitAmount: u.part.unit_amount ?? 0,
            claimed: u.part.remarks?.includes("Claimed") ?? false,
          };
        });

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

      const particularReturnItems = POSTransactions.map((s) => {
        return s.particular_transaction.map((t) => {
          return { id: s.pk, part: t };
        });
      })
        .flat(1)
        .filter((v) => v.part.description?.includes("RSI"))
        .map((u) => {
          return {
            id: parseInt(u.part.id ?? "-1"),
            itemId: parseInt(
              u.part.description?.split("***")[0].replace("RSI", "") ?? "-1"
            ),
            itemDescription: u.part.description?.split("***")[1] ?? "",
            custId: parseInt(u.id),
            qty: u.part.quantity ?? 0,
            unitAmount: u.part.unit_amount ?? 0,
            claimed: u.part.remarks?.includes("Claimed") ?? false,
          };
        });
      setSalesItems(particularSalesItems);
      setReturnItems(particularReturnItems);
      setLaborItems(particularLaborItems);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  }, [date]);

  const values = {
    customer: customer,
    setCustomer: setCustomer,
    customers: customers,
    salesItems: salesItems,
    laborItems: laborItems,
    returnItems: returnItems,
    date: date,
  };

  useEffect(() => {
    if (props.visible && currentScreen === "Sales") {
      transactionStore.deleteTransactionHistory();
      getTransactions();
    }
  }, [props.visible, currentScreen, date]);

  return loading ? (
    <LoadingView />
  ) : (
    props.visible && (
      <M1S4Context.Provider value={values}>
        <DateSelector setDate={setDate} date={date} />
        <CustomerViewItems />
      </M1S4Context.Provider>
    )
  );
};

const styles = StyleSheet.create({});
