import {
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ScrollView, StyleSheet } from "react-native";
import {
  Customer,
  CustomerLaborItem,
  CustomerSalesItem,
  Item,
  M1S1Context,
  MainContext,
  TransactionUpdateInterface,
} from "../constants/interfaces";

import {
  defaultCustomer,
  defaultLaborItem,
  defaultSalesItem,
} from "../constants/constants";
import { useStore } from "../stores/Store";
import { LoadingView } from "./G2C1";
import { ProductSearch } from "./M1S1A1";
import { CustomerQueueBar } from "./M1S1G1";
import { CustomerLaborItems } from "./M1S1G2";
import { CustomerSalesItems } from "./M1S1G3";
import { CustomerModal } from "./M1S1P1";
import { LaborItemModal } from "./M1S1P2";
import { PaymentRequestModal } from "./M1S1P3";
import { SalesItemModal } from "./M1S1P4";
import { PaymentValidationModal } from "./M1S1P5";
import { StatusPOSBar } from "./M1S1S1";
import { particularPOSStore } from "../stores/ParticularPOSStore";

export const POSView = memo(
  (props: { visible: boolean; setPOSInputFocus: (focus: boolean) => void }) => {
    const { currentScreen } = useContext(MainContext);
    const { categoryStore, transactionStore } = useStore();

    const [salesItems, setSalesItems] = useState<CustomerSalesItem[]>([]);
    const [laborItems, setLaborItems] = useState<CustomerLaborItem[]>([]);
    const [customer, setCustomer] = useState<Customer>(defaultCustomer);
    const [query, setQuery] = useState("");
    const [focus, setFocused] = useState(false);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [laborItem, setLaborItem] =
      useState<CustomerLaborItem>(defaultLaborItem);
    const [salesItem, setSalesItem] =
      useState<CustomerSalesItem>(defaultSalesItem);
    const [loading, setLoading] = useState(false);
    const [items, setitems] = useState<Item[]>([]);
    const [popup, setPopup] = useState("");

    const getCustomers = useCallback(async () => {
      try {
        setLoading(true);
        await transactionStore.fetchTransactions(`sales/?active=1`);

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
        }).filter((s) => s.isClosed === false);

        setCustomers(customerTransaction);

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
              qty: u.part?.quantity ?? 0,
              unitAmount: u.part?.unit_amount ?? 0,
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

        setSalesItems(particularSalesItems);
        setLaborItems(particularLaborItems);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.error(error);
      }
    }, []);

    const onQueryChange = useCallback((q: string) => {
      setQuery(q);
    }, []);

    const onFocusChange = useCallback((f: boolean) => {
      setFocused(f);
      props.setPOSInputFocus(f);
    }, []);

    const togglePayment = useCallback(
      async (
        status: "paid" | "validating" | "not paid",
        paidAmt?: number,
        discSalesAmt?: number,
        paidGCashAmt?: number
      ) => {
        const descDetails = (
          transactionStore.transactionDetails(`${customer.id}`)?.description ??
          ""
        ).split(", ");

        descDetails[1] = status
          .split(" ")
          .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
          .join(" ");

        descDetails[4] = (paidAmt ?? descDetails[4]).toString();
        descDetails[5] = (discSalesAmt ?? descDetails[5]).toString();
        descDetails[6] = (paidGCashAmt ?? descDetails[6]).toString();

        await transactionStore.updateTransaction(`${customer.id}`, {
          description: descDetails.join(", "),
        } as TransactionUpdateInterface);
        setCustomers((prev: Customer[]) => {
          if (paidAmt)
            (
              prev.find((s) => s.id === customer.id) ?? defaultCustomer
            ).amountPaid = paidAmt;
          if (discSalesAmt)
            (
              prev.find((s) => s.id === customer.id) ?? defaultCustomer
            ).discountSales = discSalesAmt;
          if (paidGCashAmt)
            (
              prev.find((s) => s.id === customer.id) ?? defaultCustomer
            ).amountPaidGCash = paidGCashAmt;
          (
            prev.find((s) => s.id === customer.id) ?? defaultCustomer
          ).paymentStatus = status;
          return [...prev];
        });

        if (status === "validating") {
          setCustomer({
            ...customer,
            paymentStatus: status,
            amountPaid: paidAmt ?? 0,
            discountSales: discSalesAmt ?? 0,
            amountPaidGCash: paidGCashAmt ?? 0,
          });
        } else setCustomer({ ...customer, paymentStatus: status });
      },
      [customers, customer]
    );

    const currentTotal = useMemo(() => {
      return (
        salesItems
          .filter((s) => s.custId === customer.id)
          .map((s) => {
            return {
              item: s.itemId,
              qty: s.qty,
              price: s.unitAmount,
            };
          })
          .map((s) => s?.price * s.qty ?? 0)
          .reduce((a, b) => a + b, 0) +
        laborItems
          .filter((s) => s.custId === customer.id)
          .map((s) => parseFloat(`${s.cost}`))
          .reduce((a, b) => a + b, 0)
      );
    }, [salesItems, customer, items, laborItems]);

    const values = {
      items: items,
      popup: popup,
      query: query,
      focus: focus,
      customer: customer,
      customers: customers,
      salesItem: salesItem,
      laborItem: laborItem,
      salesItems: salesItems,
      laborItems: laborItems,
      setItems: setitems,
      setPopup: setPopup,
      onQueryChange: onQueryChange,
      onFocusChange: onFocusChange,
      setCustomer: setCustomer,
      setCustomers: setCustomers,
      setSalesItem: setSalesItem,
      setLaborItem: setLaborItem,
      setSalesItems: setSalesItems,
      setLaborItems: setLaborItems,
      togglePayment: togglePayment,
      currentTotal: currentTotal,
    };

    useEffect(() => {
      if (props.visible && currentScreen === "Sales") {
        transactionStore.deleteTransactionHistory();
        getCustomers();
      }
    }, [props.visible, currentScreen]);

    return (
      props.visible && (
        <M1S1Context.Provider value={values}>
          {loading ? (
            <LoadingView />
          ) : (
            <>
              <CustomerModal />
              <LaborItemModal />
              <SalesItemModal />
              <PaymentRequestModal />
              <PaymentValidationModal />
              <CustomerQueueBar />
              <ProductSearch />
              <ScrollView style={styles.customerItems}>
                <CustomerLaborItems />
                <CustomerSalesItems />
              </ScrollView>
              <StatusPOSBar />
            </>
          )}
        </M1S1Context.Provider>
      )
    );
  }
);

const styles = StyleSheet.create({
  customerItems: {
    backgroundColor: "lightcyan",
    paddingTop: 10,
    marginTop: 60,
  },
});
