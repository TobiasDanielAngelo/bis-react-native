import moment from "moment";
import { useCallback, useContext } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Icon } from "react-native-elements";
import { defaultCustomer, winWidth } from "../constants/constants";
import {
  Customer,
  M1S1Context,
  M3S1Context,
  MainContext,
  OrderItem,
  PurchaseOrder,
  TransactionUpdateInterface,
} from "../constants/interfaces";
import { useStore } from "../stores/Store";

export const StatusOrderBar = (props: {}) => {
  const { currentUser } = useContext(MainContext);
  const { order, orderItems, orders, setOrders } = useContext(M3S1Context);
  const { transactionStore } = useStore();

  const onUpdateOrderPrint = async (toPrint: boolean) => {
    const descDetails = (
      transactionStore.transactionDetails(`${order}`)?.description ?? ""
    ).split(", ");
    descDetails[2] = toPrint ? "Print" : "Idle";

    setOrders((prev: PurchaseOrder[]) => {
      let targetOrder = prev.find((s) => s.id === order);
      if (targetOrder) targetOrder.toPrint = toPrint;
      return [...prev];
    });

    await transactionStore.updateTransaction(`${order}`, {
      description: descDetails.join(", "),
    } as TransactionUpdateInterface);
  };

  const onUpdateOrderStatus = async (status: "editing" | "processing") => {
    const descDetails = (
      transactionStore.transactionDetails(`${order}`)?.description ?? ""
    ).split(", ");
    descDetails[1] = status.charAt(0).toUpperCase() + status.slice(1);

    setOrders((prev: PurchaseOrder[]) => {
      let targetOrder = prev.find((s) => s.id === order);
      if (targetOrder) targetOrder.status = status;
      return [...prev];
    });

    await transactionStore.updateTransaction(`${order}`, {
      description: descDetails.join(", "),
    } as TransactionUpdateInterface);
  };

  const estimatedTotal = orderItems
    .filter((s) => s.orderId === order)
    .map((s) => s.purchasePrice * s.qty)
    .reduce((a, b) => a + b, 0);

  return (
    <View
      style={{
        backgroundColor: "lightcyan",
        paddingTop: 10,
        display: order !== -1 ? "flex" : "none",
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "flex-start" }}>
        <Text style={{ fontSize: 18, marginLeft: 10 }}>
          {`${orders.find((s) => s.id === order)?.supplier} (${
            orders.find((s) => s.id === order)?.creationDate
          })`}
        </Text>
      </View>
      <View style={[styles.processBar]}>
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
            color={
              orders.find((s) => s.id === order)?.toPrint ? "gold" : "white"
            }
            onPress={
              orders.find((s) => s.id === order)?.toPrint
                ? () => onUpdateOrderPrint(false)
                : () => onUpdateOrderPrint(true)
            }
          />
          {orders.find((s) => s.id === order)?.status === "editing" ? (
            <Icon
              name="send"
              size={40}
              style={styles.payBtn}
              color={"white"}
              onLongPress={() => onUpdateOrderStatus("processing")}
            />
          ) : (
            <Icon
              name="undo"
              size={40}
              style={styles.payBtn}
              color={"white"}
              onLongPress={() => onUpdateOrderStatus("editing")}
            />
          )}
        </View>
        <Text
          style={{
            color: "white",
            fontSize: 25,
            flex: 1,
            marginRight: 20,
            textAlign: "right",
            // fontFamily: "monospace",
          }}
        >
          {`Est: \u20b1${estimatedTotal.toFixed(2)}`}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  processBar: {
    backgroundColor: "darkslategray",
    height: 50,
    marginVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
