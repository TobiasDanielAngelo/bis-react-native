import {
  StyleSheet,
  TouchableOpacity,
  View,
  ScrollView,
  Text,
} from "react-native";
import { useContext } from "react";
import { Icon } from "react-native-elements";
import { Customer, MainContext, POSContext } from "../../interfaces/interfaces";
import { winWidth } from "../../constants/Constants";

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

const formatDate = (date: Date) => {
  return (
    date.getFullYear() * 1e4 + (date.getMonth() + 1) * 100 + date.getDate() + ""
  );
};

export const StatusPOSBar = (props: any) => {
  const { focused, customer, customers, paymentStatus, salesItems } =
    useContext(POSContext);

  const { currentUser } = useContext(MainContext);

  const checkIfClosable = (c: Customer) => {
    const salesItemsOfCustomer = salesItems.filter(
      (s) => s.custId === customer
    );

    return !salesItemsOfCustomer.map((s) => s.claimed).includes(false);
  };

  const handlePrint = customers.find((s) => s.id === customer)?.toPrint
    ? () => props.togglePrint("idle")
    : () => props.togglePrint("print");

  return (
    <View
      style={{
        backgroundColor: "rgb(208,224,227)",
        display: !focused ? "flex" : "none",
        paddingTop: 10,
      }}
    >
      <Text style={{ marginLeft: 10 }}>
        {customers.find((s) => s.id === customer)?.dateTransacted
          ? formatDate(
              new Date(
                customers.find((s) => s.id === customer)?.dateTransacted ?? ""
              )
            )
          : ""}
      </Text>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={{ fontSize: 18, marginLeft: 10 }}>
          {customers.find((s) => s.id === customer)?.name}
        </Text>
        {customer === -1 ? (
          <></>
        ) : (
          <Icon
            name="edit"
            size={25}
            onPress={() => props.setEditNamePopup(true)}
          />
        )}
        <Text style={styles.paymentStatusText}>
          {customer !== -1 && paymentStatus.toUpperCase()}
        </Text>
      </View>
      <View
        style={[
          styles.processBar,
          { display: customer === -1 ? "none" : "flex" },
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
            color={
              customers.find((s) => s.id === customer)?.toPrint
                ? "gold"
                : "white"
            }
            onPress={handlePrint}
          />
          {paymentStatus === "not paid" ? (
            <Icon
              name="payments"
              size={40}
              style={styles.payBtn}
              color="white"
              onPress={() => props.setPayRequestPopup(true)}
            />
          ) : paymentStatus === "validating" ? (
            <Icon
              name="undo"
              size={40}
              style={styles.payBtn}
              color="white"
              onPress={() => props.togglePayment("not paid")}
            />
          ) : (
            currentUser.privilege !== "3" &&
            checkIfClosable(
              customers.find((s) => s.id === customer) ?? defaultCustomer
            ) && (
              <Icon
                name="close"
                size={40}
                style={styles.payBtn}
                color="white"
                onPress={props.closeTransaction}
              />
            )
          )}
        </View>
        <View
          style={{
            display:
              customer !== -1 &&
              paymentStatus !== "not paid" &&
              currentUser.privilege !== "3"
                ? "flex"
                : "none",
          }}
        >
          <Icon
            name="star"
            size={40}
            style={styles.payBtn}
            color={paymentStatus === "paid" ? "gold" : "white"}
            onPress={
              paymentStatus === "paid"
                ? () => {}
                : () => {
                    props.setPayValidationPopup(true);
                    // props.togglePayment("paid");
                  }
            }
            onLongPress={
              paymentStatus === "paid"
                ? () => {
                    props.togglePayment("validating");
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
            {props.currentTotal}
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
