import { useCallback, useContext, useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Icon } from "react-native-elements";
import { defaultCustomer, winWidth } from "../../../constants/constants";
import {
  Customer,
  MainContext,
  POSContext,
} from "../../../constants/interfaces";
import { useStore } from "../../../stores/Store";
import { TransactionUpdateInterface } from "../../../stores/TransactionStore";
import moment from "moment";

export const StatusPOSBar = (props: {}) => {
  const {
    focus,
    customer,
    salesItems,
    setPopup,
    customers,
    setCustomers,
    setCustomer,
    togglePayment,
    currentTotal,
  } = useContext(POSContext);
  const { currentUser } = useContext(MainContext);
  const { transactionStore } = useStore();

  const closeTransaction = useCallback(async () => {
    const descDetails = (
      transactionStore.transactionDetails(`${customer.id}`)?.description ?? ""
    ).split(", ");

    descDetails[3] = "Close";

    setCustomers((prev: Customer[]) => {
      (prev.find((s) => s.id === customer.id) ?? defaultCustomer).isClosed =
        true;
      return prev;
    });

    await transactionStore.updateTransaction(`${customer.id}`, {
      description: descDetails.join(", "),
    } as TransactionUpdateInterface);

    togglePrint("idle");

    setCustomer(defaultCustomer);
  }, [customers, customer]);

  const togglePrint = useCallback(
    async (status: "print" | "idle") => {
      const descDetails = (
        transactionStore.transactionDetails(`${customer.id}`)?.description ?? ""
      ).split(", ");

      descDetails[2] = status.charAt(0).toUpperCase() + status.slice(1);

      setCustomers((prev: Customer[]) => {
        (prev.find((s) => s.id === customer.id) ?? defaultCustomer).toPrint =
          status === "print";
        return [...prev];
      });

      setCustomer({ ...customer, toPrint: status === "print" });

      await transactionStore.updateTransaction(`${customer.id}`, {
        description: descDetails.join(", "),
      } as TransactionUpdateInterface);
    },
    [customers, customer]
  );

  const checkIfClosable = useCallback(
    (c: Customer) => {
      const salesItemsOfCustomer = salesItems.filter(
        (s) => s.custId === customer.id
      );

      return !salesItemsOfCustomer.map((s) => s.claimed).includes(false);
    },
    [salesItems, customer]
  );

  const handlePrint = customer.toPrint
    ? () => togglePrint("idle")
    : () => togglePrint("print");

  return (
    <View
      style={{
        backgroundColor: "rgb(208,224,227)",
        display: !focus ? "flex" : "none",
        paddingTop: 10,
      }}
    >
      <Text style={{ marginLeft: 10 }}>
        {customer.id !== -1 &&
          moment(new Date(customer.dateTransacted)).format("MMM-D h:mm A")}
      </Text>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={{ fontSize: 18, marginLeft: 10 }}>{customer.name}</Text>
        {customer.id !== -1 && (
          <Icon name="edit" size={25} onPress={() => setPopup("name")} />
        )}
        <Text style={styles.paymentStatusText}>
          {customer.id !== -1 && customer.paymentStatus.toUpperCase()}
        </Text>
      </View>
      <View
        style={[
          styles.processBar,
          { display: customer.id === -1 ? "none" : "flex" },
        ]}
      >
        <View
          style={{
            flexDirection: "row",
            flex: 1,
            alignItems: "center",
          }}
        >
          <Icon
            name="print"
            size={40}
            style={styles.printBtn}
            color={customer.toPrint ? "gold" : "white"}
            onPress={handlePrint}
          />
          {customer.paymentStatus === "not paid" ? (
            <Icon
              name="payments"
              size={40}
              style={styles.payBtn}
              color="white"
              onPress={() => setPopup("payRequest")}
            />
          ) : customer.paymentStatus === "validating" ? (
            <Icon
              name="undo"
              size={40}
              style={styles.payBtn}
              color="white"
              onPress={() => togglePayment("not paid")}
            />
          ) : (
            currentUser.privilege !== "3" &&
            checkIfClosable(customer) && (
              <Icon
                name="close"
                size={40}
                style={styles.payBtn}
                color="white"
                onPress={closeTransaction}
              />
            )
          )}
        </View>
        <View
          style={{
            display:
              customer.id !== -1 &&
              customer.paymentStatus !== "not paid" &&
              currentUser.privilege !== "3"
                ? "flex"
                : "none",
          }}
        >
          <Icon
            name="star"
            size={40}
            style={styles.payBtn}
            color={customer.paymentStatus === "paid" ? "gold" : "white"}
            onPress={
              customer.paymentStatus === "paid"
                ? () => {}
                : () => {
                    setPopup("payValidation");
                  }
            }
            onLongPress={
              customer.paymentStatus === "paid"
                ? () => {
                    togglePayment("validating");
                  }
                : () => {}
            }
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: "white",
              fontSize: winWidth / 12,
              flex: 1,
              marginRight: 20,
              textAlign: "right",
              fontFamily: "monospace",
            }}
          >
            {`\u20b1`}
            {currentTotal}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  processBar: {
    backgroundColor: "rgb(19,79,92)",
    height: 50,
    marginVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  paymentStatusText: {
    fontSize: 18,
    marginRight: 10,
    flex: 1,
    textAlign: "right",
  },
  printBtn: {
    marginLeft: 20,
    margin: 5,
  },
  payBtn: {
    margin: 5,
  },
});
