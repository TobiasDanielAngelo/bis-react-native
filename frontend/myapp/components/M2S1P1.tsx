import { useContext, useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { Icon, Overlay } from "react-native-elements";
import { M2S3Context } from "../constants/interfaces";

export const EditExpenseModal = (props: any) => {
  const [change, setChange] = useState("0");
  const [receipt, setReceipt] = useState("");
  const { popup, setPopup, expense } = useContext(M2S3Context);

  useEffect(() => {
    setReceipt("");
    setChange("0");
  }, [popup]);

  return (
    <>
      <Overlay
        isVisible={popup === "editExpense"}
        onBackdropPress={() => setPopup("")}
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
              onPress={() => setPopup("")}
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
              {expense.amount.toFixed(2)}
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
              onChangeText={(amt) =>
                setChange(
                  (isNaN(parseFloat(amt.replace(/[^.0-9]/g, "")))
                    ? ""
                    : amt.replace(/[^.0-9]/g, "")
                  ).toString()
                )
              }
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
                : (expense.amount - parseFloat(change)).toFixed(2)}
            </Text>
          </View>

          <View style={{ flexDirection: "row-reverse" }}>
            <Icon
              name={"check"}
              size={40}
              color={"gainsboro"}
              onPress={() => {
                props.updateCost(expense.amount - parseFloat(change));
                setPopup("");
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
