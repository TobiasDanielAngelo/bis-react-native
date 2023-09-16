import { useCallback, useContext } from "react";
import { Text, View, StyleSheet } from "react-native";
import { Icon, Overlay } from "react-native-elements";
import { POSContext } from "../../interfaces/interfaces";

export const laborDueToMechanic = (laborType: string, amount: number) => {
  if (laborType === "Rebore")
    return 0.5 * (amount > 300 ? amount - 300 : 0) + 100;
  if (laborType === "Press") return 0.5 * amount;
  if (laborType === "Tire Changer") return amount - 50;
  return amount;
};

export const PaymentValidationOverlay = (props: any) => {
  const { salesItems, laborItems, customer, customers, items } =
    useContext(POSContext);

  const handleCheck = useCallback(async () => {
    await props.handlePaymentValidatedSubmit();
    props.setVisible(false);
  }, [customer]);

  const salesDue = salesItems
    .filter((s) => s.custId === customer)
    .map((s) => (items.find((t) => t.id === s.itemId)?.price ?? 0) * s.qty)
    .reduce((a, b) => a + b, 0);

  const laborDue = laborItems
    .filter((s) => s.custId === customer)
    .map((s) => parseInt(`${s.cost}`))
    .reduce((a, b) => a + b, 0);

  const discount = customers.find((s) => s.id === customer)?.discountSales ?? 0;

  const amountPaid = customers.find((s) => s.id === customer)?.amountPaid ?? 0;

  const amountPaidGCash =
    customers.find((s) => s.id === customer)?.amountPaidGCash ?? 0;

  const totalLaborGivenToMechanic = laborItems
    .filter((s) => s.custId === customer && s.laborer !== "DATS")
    .map((s) => s.collected)
    .reduce((a, b) => a + b, 0);
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
            <Text style={{ fontSize: 16 }}>Validate this Transaction</Text>

            <Icon
              name={"close"}
              size={30}
              color={"#aaa"}
              onPress={() => props.setVisible(false)}
            />
          </View>

          {salesItems.length !== 0 && (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingHorizontal: 20,
              }}
            >
              <Text style={{ fontSize: 15, color: "#888" }}>
                Amount Due (Sales):
              </Text>
              <Text>{salesDue.toFixed(2)}</Text>
            </View>
          )}
          {laborItems.length !== 0 && (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingHorizontal: 20,
              }}
            >
              <Text style={{ fontSize: 15, color: "#888" }}>
                Amount Due (Labor):
              </Text>
              <Text>{laborDue.toFixed(2)}</Text>
            </View>
          )}

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingHorizontal: 20,
            }}
          >
            <Text style={{ fontSize: 15, color: "#888" }}>
              Total Amount Due:
            </Text>
            <Text>{(salesDue + laborDue).toFixed(2)}</Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingHorizontal: 20,
            }}
          >
            <Text style={{ fontSize: 15, color: "#888" }}>Less Discount:</Text>
            <Text>{discount.toFixed(2)}</Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingHorizontal: 20,
            }}
          >
            <Text style={{ fontSize: 15, color: "#888" }}>Net Due:</Text>
            <Text>{(salesDue + laborDue - discount).toFixed(2)}</Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingHorizontal: 20,
            }}
          >
            <Text style={{ fontSize: 15, color: "#888" }}>Amount Paid:</Text>
            <Text>{(amountPaid + amountPaidGCash).toFixed(2)}</Text>
          </View>

          {laborItems
            .filter((s) => s.custId === customer && s.laborer !== "DATS")
            .map((s) => (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  paddingHorizontal: 20,
                }}
                key={`laborClaim-${s.description}-${s.laborer}`}
              >
                <Text style={{ fontSize: 15, color: "#888", flex: 20 }}>
                  To {s.laborer} ({s.description.split(", ")[1]})
                </Text>
                <Icon
                  name={"star"}
                  size={20}
                  color={
                    s.collected ===
                    laborDueToMechanic(
                      s.description.split(", ")[1],
                      parseFloat(`${s.cost}`)
                    )
                      ? "darkgoldenrod"
                      : "#aaa"
                  }
                  style={{ marginRight: 10 }}
                  onPress={() =>
                    s.collected !==
                    laborDueToMechanic(
                      s.description.split(", ")[1],
                      parseFloat(`${s.cost}`)
                    )
                      ? props.handleGiven(
                          s.description,
                          laborDueToMechanic(
                            s.description.split(", ")[1],
                            parseFloat(`${s.cost}`)
                          )
                        )
                      : props.handleGiven(s.description, 0)
                  }
                />
                <Text style={{ flex: 5, textAlign: "right" }}>
                  {(
                    laborDueToMechanic(
                      s.description.split(", ")[1],
                      parseFloat(`${s.cost}`)
                    ) - s.collected
                  ).toFixed(2)}
                </Text>
              </View>
            ))}
          <Text
            style={{ fontSize: 16, fontFamily: "serif", textAlign: "center" }}
          >
            Check the payment. Is this approved?
          </Text>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingHorizontal: 20,
            }}
          >
            <Text style={{ fontSize: 20 }}>Customer (Change):</Text>
            <Text
              style={{
                fontSize: 20,
                color:
                  amountPaid +
                    amountPaidGCash -
                    salesDue -
                    laborDue +
                    discount <
                  0
                    ? "darkred"
                    : "black",
              }}
            >
              {(
                amountPaid +
                amountPaidGCash -
                salesDue -
                laborDue +
                discount
              ).toFixed(2)}
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingHorizontal: 20,
              display: totalLaborGivenToMechanic > 0 ? "flex" : "none",
            }}
          >
            <Text style={{ fontSize: 15, color: "#888" }}>
              To Mechanic (Give Back):
            </Text>
            <Text
              style={{
                color: "black",
              }}
            >
              {totalLaborGivenToMechanic.toFixed(2)}
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingHorizontal: 20,
            }}
          >
            <Text style={{ fontSize: 20 }}>Cash on Hand:</Text>
            <Text
              style={{
                fontSize: 20,
                color:
                  amountPaid +
                    amountPaidGCash -
                    salesDue -
                    laborDue +
                    discount <
                  0
                    ? "darkred"
                    : "black",
              }}
            >
              {(
                salesDue +
                laborDue -
                discount -
                totalLaborGivenToMechanic -
                amountPaidGCash
              ).toFixed(2)}
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingHorizontal: 20,
            }}
          >
            <Text style={{ fontSize: 20 }}>GCash Received:</Text>
            <Text
              style={{
                fontSize: 20,
                color:
                  amountPaid +
                    amountPaidGCash -
                    salesDue -
                    laborDue +
                    discount <
                  0
                    ? "darkred"
                    : "black",
              }}
            >
              {amountPaidGCash.toFixed(2)}
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row-reverse",
              justifyContent: "space-between",
            }}
          >
            <Icon
              name={"check"}
              size={40}
              color={"#aaa"}
              onPress={handleCheck}
            />

            <Icon
              name={"close"}
              size={40}
              color={"#aaa"}
              onPress={() => props.setVisible(false)}
            />
          </View>
        </View>
      </Overlay>
    </>
  );
};

const styles = StyleSheet.create({
  msgBox: {
    height: 500,
    width: 300,
    justifyContent: "space-between",
  },
});
