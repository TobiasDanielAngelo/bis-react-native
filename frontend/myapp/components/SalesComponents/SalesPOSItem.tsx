import { StyleSheet, View } from "react-native";
import { Icon, Text } from "react-native-elements";
import { winWidth } from "../../constants/Constants";

export const SalesPOSItem = (props: {
  quantity: number;
  description: string;
  claimed: boolean;
  price: number;
  paymentStatus: "paid" | "not paid" | "validating";
}) => {
  return (
    <View
      style={[
        styles.listItem,
        styles.shadowProp,
        {
          backgroundColor:
            props.paymentStatus !== "not paid" ? "#ddd" : "white",
        },
      ]}
    >
      <View style={{ flex: 1, flexDirection: "row" }}>
        <Text style={[styles.text, styles.col1Text]}>
          {`${props.quantity} pc${props.quantity > 1 ? "s" : ""}.`}
        </Text>
        <Text style={[styles.text, styles.col2Text]}>
          {`${props.description.substring(0, Math.round(winWidth / 18))}`}
        </Text>
      </View>
      <View style={{ flex: 1, flexDirection: "row" }}>
        <Text style={[styles.subText, styles.col1Text]}>{`@${(
          Math.round(props.price * 100) / 100
        ).toFixed(0)}/pc.`}</Text>
        <Text style={[styles.subText, styles.col2Text]}>
          {`${props.description.substring(0, Math.round(winWidth / 16))}`}
        </Text>
      </View>
      <Text style={styles.priceText}>
        {`\u20b1${(
          Math.round(props.price * props.quantity * 100) / 100
        ).toFixed(2)}`}
        <Icon
          name="star"
          size={25}
          style={{ top: 3 }}
          color={props.claimed ? "darkgoldenrod" : "gray"}
        />
      </Text>
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
  col1Text: { flex: 12 },
  col2Text: { flex: 38 },
  text: { fontSize: 18, fontFamily: "monospace" },
  subText: { fontSize: 15, fontFamily: "monospace", color: "#777" },
});
