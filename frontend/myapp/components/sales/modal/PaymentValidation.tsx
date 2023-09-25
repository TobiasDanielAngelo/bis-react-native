import { useCallback, useContext } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Icon, Overlay } from "react-native-elements";
import { CustomerLaborItem, POSContext } from "../../../constants/interfaces";
import { laborDueToMechanic } from "../../../constants/helpers";
import { useStore } from "../../../stores/Store";
import { defaultLaborItem } from "../../../constants/constants";

export const PaymentValidationModal = (props: {}) => {
  const {
    salesItems,
    laborItems,
    customer,
    customers,
    popup,
    setPopup,
    setLaborItems,
    togglePayment,
  } = useContext(POSContext);

  const { particularPOSStore } = useStore();

  const handleCheck = useCallback(() => {
    setPopup("");
    togglePayment("paid");
  }, [customer]);

  const handleGiven = useCallback(
    async (id: number, laborer: string, collected: number) => {
      await particularPOSStore.updateParticularPOS(`${id}`, {
        remarks: `${laborer} ${collected}`,
      });

      setLaborItems((prev: CustomerLaborItem[]) => {
        (prev.find((s) => s.id === id) ?? defaultLaborItem).collected =
          collected;
        return [...prev];
      });
    },
    [customer, laborItems]
  );

  const salesDue = salesItems
    .filter((s) => s.custId === customer.id)
    .map((s) => s.unitAmount * s.qty)
    .reduce((a, b) => a + b, 0);

  const laborDue = laborItems
    .filter((s) => s.custId === customer.id)
    .map((s) => parseInt(`${s.cost}`))
    .reduce((a, b) => a + b, 0);

  const discount =
    customers.find((s) => s.id === customer.id)?.discountSales ?? 0;

  const amountPaid =
    customers.find((s) => s.id === customer.id)?.amountPaid ?? 0;

  const amountPaidGCash =
    customers.find((s) => s.id === customer.id)?.amountPaidGCash ?? 0;

  const totalLaborGivenToMechanic = laborItems
    .filter((s) => s.custId === customer.id && s.laborer !== "DATS")
    .map((s) => s.collected)
    .reduce((a, b) => a + b, 0);
  return (
    <>
      <Overlay isVisible={popup === "payValidation"}>
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
              onPress={() => setPopup("")}
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
            .filter((s) => s.custId === customer.id && s.laborer !== "DATS")
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
                  To {s.laborer} ({s.description.split(" ")[1]})
                </Text>
                <Icon
                  name={"star"}
                  size={20}
                  color={
                    s.collected ===
                    laborDueToMechanic(
                      s.description.split(" ")[1],
                      parseFloat(`${s.cost}`)
                    )
                      ? "darkgoldenrod"
                      : "#aaa"
                  }
                  style={{ marginRight: 10 }}
                  onPress={() =>
                    s.collected !==
                    laborDueToMechanic(
                      s.description.split(" ")[1],
                      parseFloat(`${s.cost}`)
                    )
                      ? handleGiven(
                          s.id,
                          s.laborer,
                          laborDueToMechanic(
                            s.description.split(" ")[1],
                            parseFloat(`${s.cost}`)
                          )
                        )
                      : handleGiven(s.id, s.laborer, 0)
                  }
                />
                <Text style={{ flex: 5, textAlign: "right" }}>
                  {(
                    laborDueToMechanic(
                      s.description.split(" ")[1],
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
              onPress={() => setPopup("")}
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
