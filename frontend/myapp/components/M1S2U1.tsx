import moment from "moment";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-elements";
import { winWidth } from "../constants/constants";
import { laborDueToMechanic } from "../constants/helpers";

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
              ? "gainsboro"
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
              laborDueToMechanic(props.description, props.cost) * 100
            ) / 100
          ).toFixed(2)}`}
        </Text>
      </View>
      <Text
        style={[
          styles.descriptionText,
          {
            color:
              parseInt(
                `${laborDueToMechanic(props.description, props.cost)}`
              ) === props.collected
                ? "white"
                : "grey",
          },
        ]}
      >
        {props.customer}, {moment(new Date(props.date)).format("hh:mm A")}
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
