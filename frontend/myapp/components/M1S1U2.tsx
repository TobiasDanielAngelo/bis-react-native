import { useContext } from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-elements";
import { winWidth } from "../constants/constants";
import { laborDueToMechanic } from "../constants/helpers";
import { M1S1Context } from "../constants/interfaces";

export const LaborPOSItem = (props: {
  laborer: string;
  description: string;
  cost: number;
  collected: number;
}) => {
  const { customer } = useContext(M1S1Context);
  return (
    <View
      style={[
        styles.listItem,
        styles.shadowProp,
        {
          backgroundColor:
            customer.paymentStatus !== "not paid" ? "gainsboro" : "white",
        },
      ]}
    >
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <Text style={styles.mainItemText}>
          {props.description.replace("Labor ", "")}
        </Text>
        <Text style={styles.mainItemText}>
          {`\u20b1${(Math.round(props.cost * 100) / 100).toFixed(2)}`}
        </Text>
      </View>
      <Text style={styles.descriptionText}>
        {`${props.laborer} (${props.collected}/${laborDueToMechanic(
          props.description.replace("Labor ", ""),
          props.cost
        )} collected)`}
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
    height: 70,
  },
  shadowProp: {
    shadowColor: "black",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 7,
    elevation: 5,
  },
  descriptionText: {
    fontSize: 15,
    textAlign: "left",
    color: "grey",
    fontFamily: "monospace",
  },
  priceText: { fontSize: 19, textAlign: "right", fontFamily: "monospace" },
  mainItemText: { fontSize: 18, textAlign: "left", fontFamily: "monospace" },
});
