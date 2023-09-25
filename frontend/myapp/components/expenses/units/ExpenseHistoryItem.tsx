import moment from "moment";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-elements";
import { winWidth } from "../../../constants/constants";
import { ExpenseReviewContext, Expenses } from "../../../constants/interfaces";
import { useContext } from "react";
import { TouchableOpacity } from "react-native";

export const ExpenseHistoryItem = (props: { expense: Expenses }) => {
  const { setExpense, setPopup } = useContext(ExpenseReviewContext);

  return (
    <TouchableOpacity
      onLongPress={() => {
        setPopup("editExpense");
        setExpense(props.expense);
      }}
    >
      <View style={[styles.listItem, styles.shadowProp]}>
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Text style={styles.descriptionText}>
            {moment(new Date(props.expense.datetimeTransacted)).format(
              "MMM-D h:mm A"
            )}
          </Text>
          <Text style={styles.descriptionText}>#{props.expense.id}</Text>
        </View>
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Text style={styles.mainItemText}>{props.expense.categoryId}</Text>

          <Text style={styles.mainItemText}>
            {props.expense.amount.toFixed(2)}
          </Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Text style={styles.descriptionText}>{props.expense.remarks}</Text>
          <Text style={styles.descriptionText}>{props.expense.spender}</Text>
        </View>
      </View>
    </TouchableOpacity>
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
    height: 90,
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
