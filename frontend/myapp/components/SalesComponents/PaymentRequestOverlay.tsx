import { useCallback, useEffect, useState, useContext } from "react";
import { Text, View, StyleSheet, TextInput } from "react-native";
import { Icon, Overlay } from "react-native-elements";
import { POSContext } from "../../interfaces/interfaces";
export const PaymentRequestOverlay = (props: any) => {
  const { salesItems, customer } = useContext(POSContext);

  const [paidAmt, setPaidAmt] = useState("");
  const [paidGCashAmt, setPaidGCashAmt] = useState("0");
  const [discSalesAmt, setDiscSalesAmt] = useState("0");

  useEffect(() => {
    setPaidAmt("");
    setDiscSalesAmt("0");
    setPaidGCashAmt("0");
  }, [props.visible]);

  const handleCheck = useCallback(() => {
    console.log(
      parseFloat(paidAmt),
      isNaN(parseFloat(discSalesAmt)) ? 0 : parseFloat(discSalesAmt),
      parseFloat(paidGCashAmt)
    );
    if (!isNaN(parseFloat(paidAmt)) && !isNaN(parseFloat(paidAmt))) {
      props.handlePaymentSubmit(
        parseFloat(paidAmt),
        isNaN(parseFloat(discSalesAmt)) ? 0 : parseFloat(discSalesAmt),
        parseFloat(paidGCashAmt)
      );
      props.setVisible(false);
    }
  }, [paidAmt, discSalesAmt, paidGCashAmt]);

  return (
    <>
      <Overlay isVisible={props.visible}>
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
              onPress={() => props.setVisible(false)}
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
              .filter((s) => s.custId === customer)
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
            <Text>{props.total.toFixed(2)}</Text>
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
              props.total -
                (isNaN(parseFloat(discSalesAmt)) ? 0 : parseFloat(discSalesAmt))
                ? (
                    parseFloat(paidAmt) +
                    parseFloat(paidGCashAmt) -
                    (props.total -
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
