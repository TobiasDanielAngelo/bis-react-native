import { Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useCallback, useEffect, useState } from "react";
import {
  Customer,
  CustomerSalesItem,
  Item,
  RefundContext,
} from "../interfaces/interfaces";
import { useStore } from "../stores/Store";
import { LoadingScreen } from "../components/SalesComponents/LoadingScreen";
import { RefundSearchInputAutoComplete } from "../components/SalesComponents/RefundSearchInputAutoComplete";
import { SalesRefundItem } from "../components/SalesComponents/SalesRefundItem";
import { ReturnItemOverlay } from "../components/SalesComponents/ReturnItemOverlay";
import {
  TransactionItemInterface,
  TransactionUpdateInterface,
} from "../stores/TransactionStore";
import { defaultSalesItem } from "./POSView";

export const RefundView = (props: any) => {
  const { categoryStore, productStore, transactionStore } = useStore();
  const [dataList, setDataList] = useState<Item[]>([]);
  const [salesItems, setSalesItems] = useState<CustomerSalesItem[]>([]);
  const [returnItems, setReturnItems] = useState<CustomerSalesItem[]>([]);
  const [salesItem, setSalesItem] = useState(-1);
  const [customer, setCustomer] = useState(-1);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [returnPopup, setReturnPopup] = useState(false);

  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [item, setItem] = useState("");
  const [focused, setFocused] = useState(false);

  const getCategories = useCallback(async () => {
    await categoryStore.fetchCategories();
  }, []);

  const getTransactions = useCallback(async () => {
    try {
      await transactionStore.fetchTransactions("incomes/");
      await transactionStore.fetchTransactions("expenses/");
      const POSTransactions = transactionStore.transactions.filter(
        (s) => s.category === categoryStore.categoryId("Point of Sales")
      );
      const ReturnTransactions = transactionStore.transactions.filter(
        (s) => s.category === categoryStore.categoryId("Return of Sale Items")
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
          discountSales: parseFloat(descDetails[5]) as number,
          toPrint: descDetails[2] === "Print",
          isClosed: descDetails[3] === "Close",
          dateTransacted: s.datetime_transacted,
        };
      });

      setCustomers((prev) => customerTransaction);

      const particularItems = POSTransactions.map((s) => {
        return s.particular_transaction.map((t) => {
          return { id: s.pk, part: t };
        });
      })
        .flat(1)
        .filter((v) => v.part.description.includes("SKU"))
        .map((u) => {
          return {
            itemId: parseInt(u.part.description.replace("SKU", "")),
            custId: parseInt(u.id),
            qty: u.part.quantity,
            claimed: u.part.remarks.includes("Claimed"),
          };
        });

      const particularReturnedItems = ReturnTransactions.map((s) => {
        return s.particular_transaction.map((t) => {
          return { id: s.pk, part: t, desc: s.description };
        });
      })
        .flat(1)
        .map((u) => {
          return {
            itemId: parseInt(u.part.description.replace("SKU", "")),
            custId: parseInt(u.desc.split(" ")[1]),
            qty: u.part.quantity,
            claimed: u.part.remarks.includes("Claimed"),
          };
        });

      setSalesItems(particularItems);
      setReturnItems(particularReturnedItems);

      // setLoading(false);
    } catch (error) {
      // setLoading(false);
      console.error(error);
    }
  }, [customer, salesItem]);

  const getProducts = useCallback(async () => {
    try {
      setLoading(true);
      const resp = await productStore.fetchProducts();
      resp.data?.forEach((s) => {
        if (!dataList.map((s) => `${s.id}`).includes(`${s.pk}`))
          setDataList((prev) => [
            ...prev,
            {
              id: parseInt(s.pk),
              name: s.description,
              price: s.sell_price,
            } as Item,
          ]);
      });
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  }, [dataList]);

  const handleReturnSubmit = useCallback(
    async (qty: number) => {
      const resp = await transactionStore.addTransaction({
        category: categoryStore.categoryId("Return of Sale Items") ?? "-1",
        description: `Return ${customer} ${salesItem}`,
        transmitter: "DATS",
        receiver: customers.find((s) => s.id === customer)?.name ?? "",
        particular_transaction: [
          {
            description: `SKU${salesItem}`,
            remarks: ``,
            quantity: qty,
            unit_amount: dataList.find((s) => s.id === salesItem)?.price ?? 0,
          },
        ],
      });

      setReturnItems((prev: CustomerSalesItem[]) => {
        return [
          ...prev,
          {
            itemId: salesItem,
            custId: customer,
            qty: qty,
            claimed: true,
          },
        ];
      });
    },
    [customer, salesItem]
  );

  const handleQueryChange = useCallback((q: string) => {
    setQuery(q);
  }, []);

  const handleFocusedChange = useCallback((f: boolean) => {
    setFocused(f);
    props.setRefundInputFocus(f);
  }, []);

  useEffect(() => {
    getCategories();
    getProducts();
  }, []);

  useEffect(() => {
    if (props.visible) {
      setItem("");
      getTransactions();
      if (true) {
        const interval = setInterval(() => {
          getTransactions();
        }, 10000);
        return () => clearInterval(interval);
      }
    }
  }, [props.visible]);

  return (
    props.visible &&
    (loading ? (
      <LoadingScreen />
    ) : (
      <RefundContext.Provider
        value={{
          items: dataList,
          query: query,
          handleQueryChange: handleQueryChange,
          focused: focused,
          handleFocusedChange: handleFocusedChange,
          salesItem: salesItem,
          salesItems: salesItems,
        }}
      >
        <ReturnItemOverlay
          visible={returnPopup}
          setVisible={setReturnPopup}
          handleReturnSubmit={handleReturnSubmit}
          maxQty={
            (salesItems.find(
              (s) => s.custId === customer && s.itemId === salesItem
            )?.qty ?? 0) -
            (returnItems
              .filter((t) => t.custId === customer && t.itemId === salesItem)
              .map((s) => s.qty)
              .reduce((a, b) => a + b, 0) ?? 0)
          }
        />
        <RefundSearchInputAutoComplete disabled={false} setItem={setItem} />
        <ScrollView style={styles.laborItems}>
          <Text
            style={{
              display: item === "" ? "none" : "flex",
              margin: 10,
            }}
          >
            Showing results for:
          </Text>
          <Text
            style={{ fontSize: 20, textAlign: "center", marginHorizontal: 20 }}
          >
            {item}
          </Text>
          <Text
            style={{
              display: item === "" ? "none" : "flex",
              fontSize: 20,
              textAlign: "center",
              marginHorizontal: 20,
            }}
          >
            P{dataList.find((s) => s.name === item)?.price}
          </Text>
          {salesItems
            .filter(
              (s) =>
                (dataList.find((t) => t.id === s.itemId)?.name ?? "") ===
                  item &&
                customers.find((t) => t.id === s.custId)?.paid === "paid"
            )
            .map((s) => (
              <TouchableOpacity
                onPress={() => {
                  setSalesItem(s.itemId);
                  setCustomer(s.custId);
                  setReturnPopup(true);
                }}
                key={`refund-${s.custId}-${s.itemId}`}
              >
                {/* <Text>
                  {}
                </Text> */}
                <SalesRefundItem
                  quantity={
                    s.qty -
                    (returnItems
                      .filter(
                        (t) => t.custId === s.custId && t.itemId === s.itemId
                      )
                      .map((s) => s.qty)
                      .reduce((a, b) => a + b, 0) ?? 0)
                  }
                  claimed={s.claimed}
                  price={dataList.find((t) => t.id === s.itemId)?.price ?? 0}
                  paymentStatus={
                    customers.find((t) => t.id === s.custId)?.paid ?? "not paid"
                  }
                  customerName={
                    customers.find((t) => t.id === s.custId)?.name ?? ""
                  }
                  custId={s.custId}
                  dateTransacted={
                    customers.find((t) => t.id === s.custId)?.dateTransacted ??
                    ""
                  }
                  discountSales={
                    customers.find((t) => t.id === s.custId)?.discountSales ?? 0
                  }
                />
              </TouchableOpacity>
            ))}
        </ScrollView>
      </RefundContext.Provider>
    ))
  );
};

const styles = StyleSheet.create({
  laborItems: {
    backgroundColor: "rgb(208,224,227)",
    marginTop: 60,
  },
});
