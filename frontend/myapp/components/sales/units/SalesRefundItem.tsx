import { StyleSheet, View } from "react-native";
import { Text } from "react-native-elements";
import { winWidth } from "../../../constants/constants";
import { formatDate, formatTime } from "../../../constants/helpers";

export const SalesRefundItem = (props: {
  quantity: number;
  claimed: boolean;
  price: number;
  paymentStatus: "paid" | "not paid" | "validating";
  customerName: string;
  custId: number;
  dateTransacted: string;
  discountSales: number;
}) => {
  return (
    <View
      style={[
        styles.listItem,
        styles.shadowProp,
        {
          backgroundColor: props.paymentStatus === "paid" ? "white" : "#ddd",
        },
      ]}
    >
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={[styles.text, styles.col1Text]}>
            #{props.custId} -{" "}
            {`${props.quantity} pc${props.quantity > 1 ? "s" : ""}.`}{" "}
          </Text>
          <Text>
            {formatDate(new Date(props.dateTransacted))}{" "}
            {formatTime(new Date(props.dateTransacted))}
          </Text>
        </View>

        <Text style={[styles.text, styles.col1Text]}>{props.customerName}</Text>
        <Text style={[styles.text, styles.col1Text]}>
          Given Discount: P{props.discountSales.toFixed(2)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  listItem: {
    backgroundColor: "white",
    padding: 10,
    marginTop: 10,
    marginHorizontal: 10,
    marginBottom: 7,
    width: winWidth - 20,
    height: 100,
  },
  shadowProp: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 7,
    elevation: 5,
  },
  priceText: { fontSize: 19, textAlign: "right", fontFamily: "monospace" },
  mainItemText: { fontSize: 18, fontFamily: "monospace" },
  col1Text: { flex: 1 },
  col2Text: { flex: 1, textAlign: "right", justifyContent: "center" },
  bigText: { fontSize: 30, fontFamily: "monospace" },
  text: { fontSize: 18, fontFamily: "monospace" },
  subText: { fontSize: 15, fontFamily: "monospace", color: "#777" },
});
