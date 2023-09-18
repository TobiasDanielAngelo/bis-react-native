import { ScrollView, StyleSheet, View } from "react-native";
import { useCallback, useEffect, useState, useMemo } from "react";
import {
  Customer,
  CustomerSalesItem,
  CustomerLaborItem,
  Item,
  POSContext,
} from "../interfaces/interfaces";

import { useStore } from "../stores/Store";
import {
  TransactionItemInterface,
  TransactionUpdateInterface,
} from "../stores/TransactionStore";

import { observer } from "mobx-react-lite";
import { AddLaborItemOverlay } from "../components/SalesComponents/AddLaborItemOverlay";
import { LoadingScreen } from "../components/SalesComponents/LoadingScreen";
import { NewCustomerOverlay } from "../components/SalesComponents/NewCustomerOverlay";
import { EditCustomerOverlay } from "../components/SalesComponents/EditCustomerOverlay";
import { UpdateItemOverlay } from "../components/SalesComponents/UpdateItemOverlay";
import { PaymentRequestOverlay } from "../components/SalesComponents/PaymentRequestOverlay";
import { PaymentValidationOverlay } from "../components/SalesComponents/PaymentValidationOverlay";
import { CustomerQueueBar } from "../components/SalesComponents/CustomerQueueBar";
import { SearchInputAutoComplete } from "../components/SalesComponents/SearchInputAutoComplete";
import { CustomerLaborItems } from "../components/SalesComponents/CustomerLaborItems";
import { CustomerSalesItems } from "../components/SalesComponents/CustomerSalesItems";
import { StatusPOSBar } from "../components/SalesComponents/StatusPOSBar";
import { useRoute } from "@react-navigation/native";

export const formatDate = (date: Date) => {
  return (
    date.getFullYear() * 1e4 + (date.getMonth() + 1) * 100 + date.getDate() + ""
  );
};

export const formatTime = (date: Date) => {
  return `${date.getHours()}:${date.getMinutes()}`;
};

export const defaultCustomer = {
  id: -1,
  name: "",
  paid: "not paid",
  amountPaid: 0,
  amountPaidGCash: 0,
  discountSales: 0,
  toPrint: false,
  isClosed: false,
} as Customer;

export const defaultSalesItem = {
  itemId: -1,
  custId: -1,
  qty: 0,
  claimed: false,
} as CustomerSalesItem;

export const defaultLaborItem = {
  id: -1,
  custId: -1,
  laborer: "",
  description: "",
  cost: 0,
  collected: 0,
} as CustomerLaborItem;

export const POSView = observer((props: any) => {
  const [salesItems, setSalesItems] = useState<CustomerSalesItem[]>([]);
  const [laborItems, setLaborItems] = useState<CustomerLaborItem[]>([]);
  const [customer, setCustomer] = useState(-1);
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [laborItem, setLaborItem] = useState(-1);
  const [salesItem, setSalesItem] = useState(-1);

  const [popup, setPopup] = useState<
    | ""
    | "name"
    | "editName"
    | "update"
    | "payRequest"
    | "payValidation"
    | "labor"
  >("");

  // const [namePopup, setNamePopup] = useState(false);
  // const [editNamePopup, setEditNamePopup] = useState(false);
  // const [updatePopup, setUpdatePopup] = useState(false);
  // const [payRequestPopup, setPayRequestPopup] = useState(false);
  // const [payValidationPopup, setPayValidationPopup] = useState(false);
  // const [laborPopup, setLaborPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dataList, setDataList] = useState<Item[]>([]);
  const [autoUpdate, setAutoUpdate] = useState(false);

  const { categoryStore, transactionStore, productStore } = useStore();

  const getCategories = useCallback(async () => {
    await categoryStore.fetchCategories();
  }, []);

  const handleGiven = async (description: string, collected: number) => {
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

  const deleteTransactionHistory = () => {
    transactionStore.deleteTransactionHistory();
  };

  const getTransactions = useCallback(async () => {
    try {
      // setLoading(true);
      await transactionStore.fetchTransactions(
        `sales/?date=${formatDate(new Date())}`
      );
      await transactionStore.fetchTransactions(`sales/?active=1`);
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
          discountSales: parseFloat(descDetails[5]) as number,
          amountPaidGCash: parseFloat(descDetails[6]) as number,
          toPrint: descDetails[2] === "Print",
          isClosed: descDetails[3] === "Close",
          dateTransacted: s.datetime_transacted,
        };
      }).filter((s) => s.isClosed === false);

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

      setSalesItems(particularItems);
      setLaborItems(particularLaborItems);
      // setLoading(false);
    } catch (error) {
      // setLoading(false);
      console.error(error);
    }
  }, []);

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

  useEffect(() => {
    getCategories();
    getProducts();
  }, []);

  const route = useRoute();

  useEffect(() => {
    if (props.visible) {
      deleteTransactionHistory();
      getTransactions();

      if (true) {
        const interval = setInterval(() => {
          getTransactions();
        }, 10000);
        return () => clearInterval(interval);
      }
    }
  }, [autoUpdate, props.visible]);

  const addItemToCart = useCallback(
    async (item: CustomerSalesItem) => {
      if (
        !salesItems.some(
          (s) => s.custId === item.custId && s.itemId === item.itemId
        )
      ) {
        let particulars =
          transactionStore.transactions.find((s) => `${s.pk}` === `${customer}`)
            ?.particular_transaction ?? [];
        setSalesItems((prev) => [...prev, item]);
        await transactionStore.updateTransaction(`${customer}`, {
          particular_transaction: [
            ...particulars,
            {
              remarks: "",
              description: `SKU${item.itemId}`,
              quantity: 1,
              unit_amount: productStore.productPrice(`${item.itemId}`),
            } as TransactionItemInterface,
          ],
        } as TransactionUpdateInterface);
      }
    },
    [customer, salesItems]
  );

  const handleQueryChange = useCallback((q: string) => {
    setQuery(q);
  }, []);

  const handleFocusedChange = useCallback((f: boolean) => {
    setFocused(f);
    props.setPOSInputFocus(f);
  }, []);

  const handleNameSubmit = useCallback(async (name: string) => {
    const resp = await transactionStore.addTransaction({
      category: categoryStore.categoryId("Point of Sales") ?? "-1",
      description: "POS #, Not Paid, Idle, Open, 0, 0, 0",
      transmitter: name,
      receiver: "DATS",
      particular_transaction: [],
    });
    setCustomer(parseInt(resp.data?.pk ?? "-1"));

    setCustomers((prev: Customer[]) => [
      ...prev,
      {
        id: parseInt(resp.data?.pk ?? "-1"),
        name: name,
        paid: "not paid",
        amountPaid: 0,
        amountPaidGCash: 0,
        discountSales: 0,
        toPrint: false,
        isClosed: false,
        dateTransacted: "",
      },
    ]);
  }, []);

  const closeTransaction = async () => {
    const descDetails = (
      transactionStore.transactionDetails(`${customer}`)?.description ?? ""
    ).split(", ");

    descDetails[3] = "Close";

    await transactionStore.updateTransaction(`${customer}`, {
      description: descDetails.join(", "),
    } as TransactionUpdateInterface);

    setCustomers((prev: Customer[]) => {
      (prev.find((s) => s.id === customer) ?? defaultCustomer).isClosed = true;
      return prev;
    });

    togglePrint("idle");

    await getTransactions();

    setCustomer(-1);
  };

  const handleAddLaborSubmit = async (
    laborItem: CustomerLaborItem,
    laborId: number
  ) => {
    let particulars =
      transactionStore.transactionDetails(`${customer}`)
        ?.particular_transaction ?? [];

    const resp = await transactionStore.updateTransaction(`${customer}`, {
      particular_transaction: [
        ...particulars,
        {
          remarks: `${laborItem.laborer} 0`,
          description: laborItem.description,
          quantity: 1,
          unit_amount: laborItem.cost,
        } as TransactionItemInterface,
      ],
    } as TransactionUpdateInterface);

    const arrId =
      resp.data?.particular_transaction.map((s) => parseInt(`${s?.id}`)) ?? [];
    const lastId = arrId[arrId?.length - 1];

    setLaborItems((prev) => [
      ...prev,
      {
        id: lastId,
        custId: customer,
        laborer: laborItem.laborer,
        description: laborItem.description,
        cost: laborItem.cost,
        collected: laborItem.collected,
      },
    ]);
  };

  const handleEditLaborSubmit = async (
    mechanic: string,
    labor: string,
    cost: number
  ) => {
    let particulars =
      transactionStore.transactionDetails(`${customer}`)
        ?.particular_transaction ?? [];

    const modifiedParticulars = JSON.parse(JSON.stringify(particulars)).map(
      (s: TransactionItemInterface) => {
        if (parseInt(s.id ?? "-1") === laborItem) {
          s.description = `${s.description.split(" ")[0]} ${labor}`;
          (s.remarks = `${mechanic} 0`), (s.unit_amount = cost);
        }
        return s;
      }
    );

    await transactionStore.updateTransaction(`${customer}`, {
      particular_transaction: modifiedParticulars,
    } as TransactionUpdateInterface);

    setLaborItems((prev: CustomerLaborItem[]) => {
      (
        prev.find((s) => s.custId === customer && s.id === laborItem) ??
        defaultLaborItem
      ).description = `${
        (
          prev.find((s) => s.custId === customer && s.id === laborItem) ??
          defaultLaborItem
        ).description.split(", ")[0]
      }, ${labor}`;
      (
        prev.find((s) => s.custId === customer && s.id === laborItem) ??
        defaultLaborItem
      ).laborer = mechanic;
      (
        prev.find((s) => s.custId === customer && s.id === laborItem) ??
        defaultLaborItem
      ).cost = cost;
      return [...prev];
    });
  };

  const handleDelete = useCallback(async () => {
    let particulars = transactionStore.transactionDetails(
      `${customer}`
    )?.particular_transaction;

    const modifiedParticulars = JSON.parse(JSON.stringify(particulars)).filter(
      (s: TransactionItemInterface) =>
        parseInt(s.description.replace("SKU", "")) !== salesItem
    );

    await transactionStore.updateTransaction(`${customer}`, {
      particular_transaction: modifiedParticulars,
    } as TransactionUpdateInterface);

    setSalesItems((prev: CustomerSalesItem[]) => {
      const currentItemIndex = prev.findIndex(
        (s) => s.custId === customer && s.itemId === salesItem
      );
      prev.splice(currentItemIndex, 1);
      return [...prev];
    });
  }, [customer, salesItem]);

  const handleLaborDelete = useCallback(async () => {
    let particulars = transactionStore.transactionDetails(
      `${customer}`
    )?.particular_transaction;

    const modifiedParticulars = JSON.parse(JSON.stringify(particulars)).filter(
      (s: TransactionItemInterface) => parseInt(s?.id ?? "-1") !== laborItem
    );

    await transactionStore.updateTransaction(`${customer}`, {
      particular_transaction: modifiedParticulars,
    } as TransactionUpdateInterface);

    setLaborItems((prev: CustomerLaborItem[]) => {
      const currentItemIndex = prev.findIndex(
        (s) => s.custId === customer && s.id === laborItem
      );
      prev.splice(currentItemIndex, 1);
      return [...prev];
    });
  }, [customer, laborItem]);

  const handleUpdateSubmit = useCallback(
    async (qty: number) => {
      let particulars = transactionStore.transactionDetails(
        `${customer}`
      )?.particular_transaction;

      const modifiedParticulars = JSON.parse(JSON.stringify(particulars)).map(
        (s: TransactionItemInterface) => {
          if (parseInt(s.description.replace("SKU", "")) === salesItem) {
            s.quantity = qty;
          }
          return s;
        }
      );

      await transactionStore.updateTransaction(`${customer}`, {
        particular_transaction: modifiedParticulars,
      } as TransactionUpdateInterface);

      setSalesItems((prev: CustomerSalesItem[]) => {
        (
          prev.find((s) => s.custId === customer && s.itemId === salesItem) ??
          defaultSalesItem
        ).qty = qty;
        return [...prev];
      });
    },
    [customer, salesItem]
  );

  const handleUpdateNameSubmit = useCallback(
    async (name: string) => {
      await transactionStore.updateTransaction(`${customer}`, {
        transmitter: name,
      } as TransactionUpdateInterface);
      setCustomers((prev: Customer[]) => {
        (prev.find((s) => s.id === customer) ?? defaultCustomer).name = name;
        return [...prev];
      });
    },
    [customer]
  );

  const togglePrint = useCallback(
    async (status: "print" | "idle") => {
      const descDetails = (
        transactionStore.transactionDetails(`${customer}`)?.description ?? ""
      ).split(", ");

      descDetails[2] = status.charAt(0).toUpperCase() + status.slice(1);

      await transactionStore.updateTransaction(`${customer}`, {
        description: descDetails.join(", "),
      } as TransactionUpdateInterface);

      setCustomers((prev: Customer[]) => {
        (prev.find((s) => s.id === customer) ?? defaultCustomer).toPrint =
          status === "print";
        return [...prev];
      });
    },
    [customer]
  );

  const toggleClaimed = useCallback(
    async (itemId: number, claimed: boolean) => {
      let particulars = transactionStore.transactionDetails(
        `${customer}`
      )?.particular_transaction;

      const modifiedParticulars = JSON.parse(JSON.stringify(particulars)).map(
        (s: TransactionItemInterface) => {
          if (parseInt(s.description.replace("SKU", "")) === itemId) {
            s.remarks = claimed ? `Claimed ${new Date().toISOString()}` : "";
          }
          return s;
        }
      );

      await transactionStore.updateTransaction(`${customer}`, {
        particular_transaction: modifiedParticulars,
      } as TransactionUpdateInterface);

      setSalesItems((prev: CustomerSalesItem[]) => {
        (
          prev.find((s) => s.custId === customer && s.itemId === itemId) ??
          defaultSalesItem
        ).claimed = claimed;
        return [...prev];
      });
    },
    [customer]
  );

  const togglePayment = useCallback(
    async (
      status: "paid" | "validating" | "not paid",
      paidAmt?: number,
      discSalesAmt?: number,
      paidGCashAmt?: number
    ) => {
      console.log("[3]", paidAmt, discSalesAmt, paidGCashAmt);

      const descDetails = (
        transactionStore.transactionDetails(`${customer}`)?.description ?? ""
      ).split(", ");

      descDetails[1] = status
        .split(" ")
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join(" ");

      descDetails[4] = (paidAmt ?? descDetails[4]).toString();
      descDetails[5] = (discSalesAmt ?? descDetails[5]).toString();
      descDetails[6] = (paidGCashAmt ?? descDetails[6]).toString();

      await transactionStore.updateTransaction(`${customer}`, {
        description: descDetails.join(", "),
      } as TransactionUpdateInterface);
      setCustomers((prev: Customer[]) => {
        (prev.find((s) => s.id === customer) ?? defaultCustomer).paid = status;
        return [...prev];
      });
    },
    [customer]
  );

  const handlePaymentSubmit = useCallback(
    (paidAmt: number, discSalesAmt: number, paidGCashAmt: number) => {
      setCustomers((prev: Customer[]) => {
        (prev.find((s) => s.id === customer) ?? defaultCustomer).amountPaid =
          paidAmt;
        (prev.find((s) => s.id === customer) ?? defaultCustomer).discountSales =
          discSalesAmt;
        (
          prev.find((s) => s.id === customer) ?? defaultCustomer
        ).amountPaidGCash = paidGCashAmt;
        (prev.find((s) => s.id === customer) ?? defaultCustomer).paid =
          "validating";
        return [...prev];
      });

      togglePayment("validating", paidAmt, discSalesAmt, paidGCashAmt);
    },
    [customer]
  );

  const handlePaymentValidatedSubmit = useCallback(() => {
    setCustomers((prev: Customer[]) => {
      (prev.find((s) => s.id === customer) ?? defaultCustomer).paid = "paid";
      return [...prev];
    });
    togglePayment("paid");
  }, [customer]);

  const payment = useMemo(
    () => customers.find((s) => s.id === customer)?.paid ?? "not paid",
    [customers, customer]
  );

  const currentTotal = useMemo(() => {
    return (
      salesItems
        .filter((s) => s.custId === customer)
        .map((s) => {
          return {
            item: dataList.find((t) => t.id === s.itemId),
            qty: s.qty,
          };
        })
        .map((s) => (s?.item?.price ?? 1) * s.qty ?? 0)
        .reduce((a, b) => a + b, 0) +
      laborItems
        .filter((s) => s.custId === customer)
        .map((s) => parseFloat(`${s.cost}`))
        .reduce((a, b) => a + b, 0)
    );
  }, [salesItems, customer, dataList, laborItems]);

  return (
    props.visible && (
      <POSContext.Provider
        value={{
          items: dataList,
          query: query,
          handleQueryChange: handleQueryChange,
          focused: focused,
          handleFocusedChange: handleFocusedChange,
          addItemToCart: addItemToCart,
          customer: customer,
          setCustomer: setCustomer,
          customers: customers,
          salesItem: salesItem,
          laborItem: laborItem,
          salesItems: salesItems,
          laborItems: laborItems,
          paymentStatus: payment,
          popup: popup,
          setPopup: setPopup,
        }}
      >
        {loading ? (
          <LoadingScreen />
        ) : (
          <>
            <NewCustomerOverlay handleNameSubmit={handleNameSubmit} />
            <AddLaborItemOverlay
              handleAddLaborSubmit={handleAddLaborSubmit}
              handleEditLaborSubmit={handleEditLaborSubmit}
              handleDelete={handleLaborDelete}
            />
            <EditCustomerOverlay handleUpdateSubmit={handleUpdateNameSubmit} />
            <UpdateItemOverlay
              handleDelete={handleDelete}
              handleUpdateSubmit={handleUpdateSubmit}
            />
            <PaymentRequestOverlay
              handlePaymentSubmit={handlePaymentSubmit}
              total={currentTotal}
            />
            <PaymentValidationOverlay
              handleGiven={handleGiven}
              handlePaymentValidatedSubmit={handlePaymentValidatedSubmit}
            />
            <CustomerQueueBar />
            <SearchInputAutoComplete
              disabled={customer === -1 || payment !== "not paid"}
              setLaborItem={setLaborItem}
            />
            <View style={{ marginTop: 75 }} />
            <ScrollView style={styles.customerItems}>
              <CustomerLaborItems setLaborItem={setLaborItem} />
              <CustomerSalesItems
                setSalesItem={setSalesItem}
                toggleClaimed={toggleClaimed}
              />
            </ScrollView>

            <StatusPOSBar
              closeTransaction={closeTransaction}
              togglePayment={togglePayment}
              togglePrint={togglePrint}
              currentTotal={currentTotal}
            />
          </>
        )}
      </POSContext.Provider>
    )
  );
});

const styles = StyleSheet.create({
  customerItems: {
    backgroundColor: "rgb(208,224,227)",
    paddingTop: 5,
  },
});
