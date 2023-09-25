import { useCallback, useContext, useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { Icon, Overlay } from "react-native-elements";
import { POSContext } from "../../../constants/interfaces";
export const PaymentRequestModal = (props: {}) => {
  const { salesItems, customer, popup, setPopup, togglePayment, currentTotal } =
    useContext(POSContext);

  const [paidAmt, setPaidAmt] = useState("");
  const [paidGCashAmt, setPaidGCashAmt] = useState("0");
  const [discSalesAmt, setDiscSalesAmt] = useState("0");

  useEffect(() => {
    setPaidAmt("");
    setDiscSalesAmt("0");
    setPaidGCashAmt("0");
  }, [popup]);

  const handleCheck = useCallback(() => {
    if (!isNaN(parseFloat(paidAmt)) && !isNaN(parseFloat(paidAmt))) {
      setPopup("");
      togglePayment(
        "validating",
        parseFloat(paidAmt),
        isNaN(parseFloat(discSalesAmt)) ? 0 : parseFloat(discSalesAmt),
        parseFloat(paidGCashAmt)
      );
    }
  }, [paidAmt, discSalesAmt, paidGCashAmt]);

  return (
    <>
      <Overlay isVisible={popup === "payRequest"}>
        <View style={styles.msgBox}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Text style={{ fontSize: 16 }}>
              Send Payment Validation Request
            </Text>

            <Icon
              name={"close"}
              size={30}
              color={"#aaa"}
              onPress={() => setPopup("")}
            />
          </View>
          <Text
            style={{ fontSize: 16, fontFamily: "serif", textAlign: "center" }}
          >
            This will send a request for payment validation. Would you like to
            continue?
          </Text>
          <Text style={{ fontSize: 15, color: "#888" }}>
            Number of Items:{" "}
            {salesItems
              .filter((s) => s.custId === customer.id)
              .map((s) => s.qty)
              .reduce((a, b) => a + b, 0)}
          </Text>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingRight: 20,
            }}
          >
            <Text style={{ fontSize: 15, color: "#888" }}>Amount:</Text>
            <Text>{currentTotal.toFixed(2)}</Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingRight: 20,
            }}
          >
            <Text style={{ fontSize: 15, color: "#888" }}>Amount Paid:</Text>
            <TextInput
              style={{
                marginTop: -5,
                padding: 5,
                borderWidth: 1,
                width: 150,
                borderColor: "#aaa",
                fontSize: 15,
                height: 30,
                textAlign: "right",
              }}
              value={paidAmt}
              keyboardType="numeric"
              onChangeText={(amt) =>
                setPaidAmt(
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
              paddingRight: 20,
            }}
          >
            <Text style={{ fontSize: 15, color: "#888" }}>Paid: (GCash)</Text>
            <TextInput
              style={{
                marginTop: -5,
                padding: 5,
                borderWidth: 1,
                width: 150,
                borderColor: "#aaa",
                fontSize: 15,
                height: 30,
                textAlign: "right",
              }}
              value={paidGCashAmt}
              keyboardType="numeric"
              onChangeText={(amt) =>
                setPaidGCashAmt(
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
              paddingRight: 20,
            }}
          >
            <Text style={{ fontSize: 15, color: "#888" }}>Discount:</Text>
            <TextInput
              style={{
                marginTop: -5,
                padding: 5,
                borderWidth: 1,
                width: 150,
                borderColor: "#aaa",
                fontSize: 15,
                height: 30,
                textAlign: "right",
              }}
              value={discSalesAmt}
              onChangeText={(amt) =>
                setDiscSalesAmt(
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
              paddingRight: 20,
            }}
          >
            <Text style={{ fontSize: 15, color: "#888" }}>Change:</Text>
            <Text>
              {parseFloat(paidAmt) + parseFloat(paidGCashAmt) >=
              currentTotal -
                (isNaN(parseFloat(discSalesAmt)) ? 0 : parseFloat(discSalesAmt))
                ? (
                    parseFloat(paidAmt) +
                    parseFloat(paidGCashAmt) -
                    (currentTotal -
                      (isNaN(parseFloat(discSalesAmt))
                        ? 0
                        : parseFloat(discSalesAmt)))
                  ).toFixed(2)
                : ""}
            </Text>
          </View>
          <View style={{ flexDirection: "row-reverse" }}>
            <Icon
              name={"check"}
              size={40}
              color={"#aaa"}
              onPress={handleCheck}
            />
          </View>
        </View>
      </Overlay>
    </>
  );
};

const styles = StyleSheet.create({
  msgBox: {
    height: 320,
    width: 300,
    justifyContent: "space-between",
  },
});
