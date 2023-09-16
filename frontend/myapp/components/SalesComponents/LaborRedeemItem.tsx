import { StyleSheet, View } from "react-native";
import { Text } from "react-native-elements";
import { laborDueToMechanic } from "./PaymentValidationOverlay";
import { formatDate } from "../../containers/POSView";
import { winWidth } from "../../constants/Constants";

export const LaborRedeemItem = (props: {
  laborer: string;
  description: string;
  cost: number;
  collected: number;
  paid: "not paid" | "validating" | "paid";
  customer: string;
  date: string;
}) => {
  return (
    <View
      style={[
        styles.listItem,
        styles.shadowProp,
        {
          backgroundColor:
            props.paid !== "paid"
              ? "#ddd"
              : parseInt(
                  `${laborDueToMechanic(props.description, props.cost)}`
                ) === props.collected
              ? "teal"
              : "white",
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
        <Text
          style={[
            styles.mainItemText,
            {
              color:
                parseInt(
                  `${laborDueToMechanic(props.description, props.cost)}`
                ) === props.collected
                  ? "white"
                  : "black",
            },
          ]}
        >
          {props.description}
        </Text>
        <Text
          style={[
            styles.mainItemText,

            {
              color:
                parseInt(
                  `${laborDueToMechanic(props.description, props.cost)}`
                ) === props.collected
                  ? "white"
                  : "black",
            },
          ]}
        >
          {`\u20b1${(
            Math.round(
              props.laborer !== "DATS"
                ? laborDueToMechanic(props.description, props.cost) * 100
                : props.cost * 100
            ) / 100
          ).toFixed(2)}`}
        </Text>
      </View>
      {/* <Text
        style={[
          styles.descriptionText,
          { display: props.laborer !== "DATS" ? "flex" : "none" },
        ]}
      >
        Collected: {props.collected}{" "}
        {props.paid !== "paid" && `| Status: ${props.paid.toUpperCase()}`}
      </Text> */}
      <Text
        style={[
          styles.descriptionText,
          {
            color:
              parseInt(
                `${laborDueToMechanic(props.description, props.cost)}`
              ) === props.collected
                ? "white"
                : "#777",
          },
        ]}
      >
        {props.customer}, {formatDate(new Date(props.date))}
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
    height: 80,
  },
  shadowProp: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 7,
    elevation: 5,
  },
  descriptionText: {
    fontSize: 15,
    textAlign: "left",
    color: "#777",
    fontFamily: "monospace",
  },
  priceText: { fontSize: 19, textAlign: "right", fontFamily: "monospace" },
  mainItemText: { fontSize: 18, textAlign: "left", fontFamily: "monospace" },
});
