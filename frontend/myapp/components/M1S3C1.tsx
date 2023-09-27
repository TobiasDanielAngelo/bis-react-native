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
import {
  defaultCustomer,
  defaultPOSItem,
  defaultSalesItem,
} from "../constants/constants";
import {
  Customer,
  CustomerSalesItem,
  Item,
  M1S3Context,
  MainContext,
  POSItem,
} from "../constants/interfaces";
import { useStore } from "../stores/Store";
import { LoadingView } from "./G2C1";
import { ReturnItemModal } from "./M1S3P1";
import { SalesRefundItem } from "./M1S3U1";
import { ProductSearch } from "./M1S3A1";
import { DateSelector } from "./M1S2U2";
import { RefundableSalesItems } from "./M1S3G1";
import moment from "moment";

export const RefundView = (props: any) => {
  const { categoryStore, transactionStore } = useStore();
  const { currentScreen } = useContext(MainContext);
  const [customer, setCustomer] = useState<Customer>(defaultCustomer);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [focus, setFocused] = useState(false);
  const [item, setItem] = useState(defaultPOSItem);
  const [items, setItems] = useState<POSItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState("");
  const [query, setQuery] = useState("");
  const [returnItem, setReturnItem] = useState(defaultSalesItem);
  const [returnItems, setReturnItems] = useState<CustomerSalesItem[]>([]);
  const [salesItem, setSalesItem] = useState(defaultSalesItem);
  const [salesItems, setSalesItems] = useState<CustomerSalesItem[]>([]);
  const [date, setDate] = useState(new Date());

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

      const particularReturnedItems = POSTransactions.map((s) => {
        return s.particular_transaction.map((t) => {
          return { id: s.pk, part: t, desc: s.description };
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
      setReturnItems(particularReturnedItems);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  }, [customer, salesItem, date]);

  const onQueryChange = useCallback((q: string) => {
    setQuery(q);
  }, []);

  const onFocusChange = useCallback((f: boolean) => {
    setFocused(f);
    props.setRefundInputFocus(f);
  }, []);

  useEffect(() => {
    setDate(new Date());
  }, [props.visible, currentScreen]);

  useEffect(() => {
    if (props.visible && currentScreen === "Sales") {
      transactionStore.deleteTransactionHistory();
      getTransactions();
      // setItem(defaultPOSItem);
    }
  }, [props.visible, currentScreen, date]);

  const RefundValues = {
    customer: customer,
    customers: customers,
    focus: focus,
    item: item,
    items: items,
    onFocusChange: onFocusChange,
    onQueryChange: onQueryChange,
    popup: popup,
    query: query,
    returnItem: returnItem,
    returnItems: returnItems,
    salesItem: salesItem,
    salesItems: salesItems,
    setCustomer: setCustomer,
    setPopup: setPopup,
    setItem: setItem,
    setItems: setItems,
    setReturnItem: setReturnItem,
    setReturnItems: setReturnItems,
    setSalesItem: setSalesItem,
    setSalesItems: setSalesItems,
  };

  return (
    props.visible &&
    (loading ? (
      <LoadingView />
    ) : (
      <M1S3Context.Provider value={RefundValues}>
        <ReturnItemModal />
        <DateSelector date={date} setDate={setDate} />
        <ProductSearch />
        <RefundableSalesItems />
      </M1S3Context.Provider>
    ))
  );
};

const styles = StyleSheet.create({});
