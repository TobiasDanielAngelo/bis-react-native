import React, { useCallback, useEffect, useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import { StoreContext, createStore, useStore } from "./stores/Store";
import { TransactionUpdateInterface } from "./stores/TransactionStore";

export const defaultCustomer = {
  id: -1,
  name: "",
  paid: "not paid",
  amountPaid: 0,
  discountSales: 0,
  toPrint: false,
  isClosed: false,
} as Customer;

export type POSItem = { id: number; name: string; price: number };

export type Customer = {
  id: number;
  name: string;
  paid: "not paid" | "validating" | "paid";
  amountPaid: number;
  discountSales: number;
  toPrint: boolean;
  isClosed: boolean;
  dateTransacted: string;
};

export type CustomerLabor = {
  id: number;
  name: string;
  paid: "not paid" | "validating" | "paid";
  amountPaid: number;
};

export type Item = {
  id: number;
  name: string;
  remarks: string;
  price: number;
};

export type CustomerSalesItem = {
  itemId: number;
  custId: number;
  qty: number;
  claimed: boolean;
};
export type CustomerLaborItem = {
  id: number;
  custId: number;
  laborer: string;
  description: string;
  cost: number;
  collected: number;
};

const Body = () => {
  const [salesItems, setSalesItems] = useState<CustomerSalesItem[]>([]);
  const [laborItems, setLaborItems] = useState<CustomerLaborItem[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customer, setCustomer] = useState(-1);
  const [dataList, setDataList] = useState<Item[]>([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const { categoryStore, transactionStore, productStore, userStore } =
    useStore();

  const authUser = async () => {
    try {
      const resp = await userStore.reauthUser();
    } catch (error) {
      await userStore.loginUser({
        username: "dats",
        password: "555999",
      });
    }
  };

  window.onafterprint = () => {
    // togglePrint("idle");
    setCustomer(-1);
  };

  const printPageArea = (areaID: string) => {
    togglePrint("idle");
    let printContent = document.getElementById(areaID)?.innerHTML ?? "";
    // let originalContent = document.body.innerHTML;
    document.body.innerHTML = printContent;
    window.print();
    window.location.reload();
    // document.body.innerHTML = originalContent;
  };

  const getCategories = useCallback(async () => {
    try {
      await categoryStore.fetchCategories();
    } catch (error) {
      console.log(error);
    }
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
          discountSales: parseFloat(descDetails[5]) as number,
          toPrint: descDetails[2] === "Print",
          isClosed: descDetails[3] === "Close",
          dateTransacted: s.datetime_transacted,
        };
      }).filter((s) => s.toPrint === true);

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
          false;
        return [...prev];
      });
    },
    [customer]
  );

  useEffect(() => {
    authUser();
    getCategories();
    getProducts();
    getTransactions();

    if (true) {
      const interval = setInterval(() => {
        getTransactions();
      }, 10000);
      return () => clearInterval(interval);
    }
  }, []);

  return (
    <>
      <button
        className="button-7"
        onClick={() => {
          printPageArea("wholebody");
        }}
        style={{
          width: 200,
          margin: 10,
        }}
      >
        &#x1F5B6; Print
      </button>
      {msg}
      {customers
        .filter((s) => s.toPrint === true)
        .map((s) => (
          <button
            className="button-39"
            style={{
              marginLeft: 10,
              backgroundColor:
                customer === s.id ? "rgb(84, 118, 152)" : "white",
              color: customer === s.id ? "white" : "black",
            }}
            onClick={() => setCustomer(s.id)}
          >
            {s.id}
          </button>
        ))}
      {customer !== -1 && (
        <div id="wholebody" style={{ margin: "auto" }}>
          <h1
            style={{
              position: "absolute",
              top: 250,
              left: 515,
              color: "rgba(0,255,255,0.2)",
              fontSize: 100,
            }}
          >
            {customers.find((s) => s.id === customer)?.paid === "paid"
              ? "PAID"
              : ""}
          </h1>
          <h1
            style={{
              margin: 2,
              textAlign: "center",
              color: "darkblue",
              fontSize: 22,
            }}
          >
            DAT's Tobias Motorcycle Parts
          </h1>
          <h2
            style={{
              fontSize: 17,
              margin: 0,
              textAlign: "center",
              color: "darkblue",
            }}
          >
            251 General Luna St., Cabanatuan City
          </h2>
          <div style={{ marginTop: 20, marginLeft: 10 }}>
            Name/Address:{" "}
            <span style={{ textDecoration: "underline" }}>
              {customers.find((s) => s.id === customer)?.name}{" "}
            </span>
          </div>
          <table style={{ margin: 10, fontSize: 11.5 }}>
            <tbody>
              <tr style={{ textAlign: "center" }}>
                <th>QTY</th>
                <th>UNIT</th>
                <th>ARTICLES</th>
                <th>PRICE</th>
                <th>AMOUNT</th>
              </tr>
              {laborItems
                .filter((s) => s.custId === customer)
                .map((s) => (
                  <tr style={{ height: 22 }}>
                    <td style={{ width: 30, textAlign: "center" }}>1</td>
                    <td style={{ width: 30, textAlign: "center" }}></td>
                    <td style={{ width: 400, fontFamily: "monospace" }}>
                      {s.description.split(", ")[1].toUpperCase()}
                    </td>
                    <td
                      style={{ width: 50, textAlign: "right", paddingRight: 5 }}
                    ></td>
                    <td
                      style={{ width: 60, textAlign: "right", paddingRight: 5 }}
                    >
                      {parseFloat(`${s.cost}`)}
                      {` -`}
                    </td>
                  </tr>
                ))}
              {salesItems
                .filter((s) => s.custId === customer)
                .map((s) => (
                  <tr style={{ height: 22 }}>
                    <td style={{ width: 30, textAlign: "center" }}>{s.qty}</td>
                    <td style={{ width: 30, textAlign: "center" }}></td>
                    <td style={{ width: 400, fontFamily: "monospace" }}>
                      {dataList
                        .find((t) => t.id === s.itemId)
                        ?.name.substring(0, 25)}
                      {(dataList.find((t) => t.id === s.itemId)?.name ?? "")
                        .length > 25
                        ? "..."
                        : ""}
                    </td>
                    <td
                      style={{ width: 50, textAlign: "right", paddingRight: 5 }}
                    >
                      {s.qty === 1
                        ? ""
                        : `${parseFloat(
                            `${dataList.find((t) => t.id === s.itemId)?.price}`
                          )} -`}
                    </td>
                    <td
                      style={{ width: 60, textAlign: "right", paddingRight: 5 }}
                    >
                      {`${
                        (dataList.find((t) => t.id === s.itemId)?.price ?? 0) *
                        s.qty
                      } -`}
                    </td>
                  </tr>
                ))}
              {Array(
                15 -
                  salesItems.filter((s) => s.custId === customer).length -
                  laborItems.filter((s) => s.custId === customer).length
              )
                .fill(null)
                .map((s) => (
                  <tr style={{ height: 22 }}>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                ))}
              <tr style={{ fontSize: 17, height: 22, textAlign: "right" }}>
                <td style={{ paddingRight: 10 }} colSpan={4}>
                  Total:
                </td>
                <td style={{ textAlign: "center" }}>
                  {salesItems
                    .filter((s) => s.custId === customer)
                    .map(
                      (s) =>
                        (dataList.find((t) => t.id === s.itemId)?.price ?? 0) *
                        s.qty
                    )
                    .reduce((a, b) => a + b, 0) +
                    laborItems
                      .filter((s) => s.custId === customer)
                      .map((s) => parseInt(`${s.cost}`))
                      .reduce((a, b) => a + b, 0)}
                </td>
              </tr>
            </tbody>
          </table>
          <div style={{ margin: 0, justifyContent: "space-between" }}>
            <span style={{ marginLeft: 10, marginRight: 40 }}>
              Thank you, come again!
            </span>
            <span>___________________</span>
          </div>
          <div style={{ margin: 0, justifyContent: "space-between" }}>
            <span style={{ marginLeft: 10, marginRight: 170 }}>
              No. #{" "}
              <span style={{ textDecoration: "underline" }}>{customer}</span>
            </span>
            <span>Signature</span>
          </div>
        </div>
      )}
    </>
  );
};

const App = () => {
  const store = createStore();

  return (
    <div className="App">
      <StoreContext.Provider value={store}>
        <Body />
      </StoreContext.Provider>
    </div>
  );
};

export default App;
