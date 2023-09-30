import { useContext, useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { Icon, Overlay } from "react-native-elements";
import { Expense, M2S3Context } from "../constants/interfaces";
import { defaultExpense } from "../constants/constants";
import { useStore } from "../stores/Store";

export const EditExpenseModal = (props: {
  popup: string;
  setPopup: (t: string) => void;
  expense: Expense;
  setExpenses: (t: Expense[] | ((u: Expense[]) => Expense[])) => void;
}) => {
  const [change, setChange] = useState("0");
  const [receipt, setReceipt] = useState("");
  const { particularPOSStore, transactionStore } = useStore();

  const onUpdateExpense = async (balance: number) => {
    if (isNaN(balance)) return;
    props.setExpenses((prev: Expense[]) => {
      (prev.find((s) => s.id === props.expense.id) ?? defaultExpense).amount =
        props.expense.amount - balance;
      return [...prev];
    });

    if (receipt !== "") {
      props.setExpenses((prev: Expense[]) => {
        (
          prev.find((s) => s.id === props.expense.id) ?? defaultExpense
        ).receiptId = receipt;
        return [...prev];
      });
      await transactionStore.updateTransaction(`${props.expense.id}`, {
        description: `Receipt ${receipt}`,
      });
    }

    await particularPOSStore.addParticularPOS(
      {
        description: "***Received***",
        remarks: `${new Date().toString()}`,
        unit_amount: balance,
        quantity: 1,
      },
      props.expense.id
    );
  };

  useEffect(() => {
    setReceipt(props.expense.receiptId.replace("Receipt", ""));
    setChange("0");
  }, [props.popup, props.expense]);

  return (
    <>
      <Overlay
        isVisible={props.popup === "editExpense"}
        onBackdropPress={() => props.setPopup("")}
      >
        <View style={styles.msgBox}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 16 }}>Edit Expense</Text>
            <Icon
              name={"close"}
              size={30}
              color={"gainsboro"}
              onPress={() => props.setPopup("")}
            />
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingHorizontal: 10,
              marginTop: 10,
            }}
          >
            <Text style={{ fontSize: 20, color: "grey" }}>Receipt</Text>
            <TextInput
              style={{
                marginTop: -5,
                padding: 5,
                borderWidth: 1,
                width: 150,
                borderColor: "gainsboro",
                fontSize: 20,
                height: 40,
                textAlign: "center",
              }}
              placeholder="(Optional)"
              value={receipt}
              onChangeText={setReceipt}
            />
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingHorizontal: 10,
            }}
          >
            <Text style={{ fontSize: 20, color: "grey" }}>Previous</Text>
            <Text
              style={{
                padding: 5,
                fontSize: 20,
                height: 40,
                textAlign: "right",
              }}
            >
              {props.expense.amount.toFixed(2)}
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingHorizontal: 10,
            }}
          >
            <Text style={{ fontSize: 20, color: "grey" }}>Change</Text>
            <TextInput
              style={{
                marginTop: -5,
                padding: 5,
                borderWidth: 1,
                width: 150,
                borderColor: "gainsboro",
                fontSize: 20,
                height: 40,
                textAlign: "right",
              }}
              value={change}
              keyboardType="numeric"
              onChangeText={(amt) => {
                let n = parseFloat(amt.replace(/[^.0-9]/g, ""));
                setChange(
                  isNaN(n)
                    ? ""
                    : n > props.expense.amount
                    ? props.expense.amount.toString()
                    : n.toString()
                );
              }}
            />
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingHorizontal: 10,
            }}
          >
            <Text style={{ fontSize: 20, color: "grey" }}>Updated Cost</Text>
            <Text
              style={{
                padding: 5,
                fontSize: 20,
                height: 40,
                textAlign: "right",
              }}
            >
              {isNaN(parseFloat(change))
                ? ""
                : (props.expense.amount - parseFloat(change)).toFixed(2)}
            </Text>
          </View>

          <View style={{ flexDirection: "row-reverse" }}>
            <Icon
              name={"check"}
              size={40}
              color={"gainsboro"}
              onPress={() => {
                onUpdateExpense(parseFloat(change));
                props.setPopup("");
              }}
            />
          </View>
        </View>
      </Overlay>
    </>
  );
};

const styles = StyleSheet.create({
  msgBox: {
    height: 250,
    width: 300,
    justifyContent: "space-between",
  },
});
