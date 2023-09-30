import { ScrollView, StyleSheet, Text } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { SalesRefundItem } from "./M1S3U1";
import { useContext } from "react";
import { M1S3Context } from "../constants/interfaces";
import { defaultCustomer, defaultSalesItem } from "../constants/constants";

export const RefundableSalesItems = () => {
  const {
    item,
    salesItems,
    customers,
    setSalesItem,
    setCustomer,
    setPopup,
    setReturnItem,
    returnItems,
  } = useContext(M1S3Context);

  return (
    <ScrollView style={styles.laborItems}>
      <Text
        style={{
          display: item.id === -1 ? "none" : "flex",
          margin: 10,
        }}
      >
        Showing results for:
      </Text>
      <Text style={{ fontSize: 20, textAlign: "center", marginHorizontal: 20 }}>
        {item.name}
      </Text>
      <Text
        style={{
          display: item.id === -1 ? "none" : "flex",
          fontSize: 20,
          textAlign: "center",
          marginHorizontal: 20,
        }}
      >
        P{item.price}
      </Text>
      {salesItems
        .filter(
          (s) =>
            s.itemId === item.id &&
            customers.find((t) => t.id === s.custId)?.paymentStatus === "paid"
        )
        .map((s) => (
          <TouchableOpacity
            onPress={() => {
              setSalesItem(s);
              setReturnItem(
                returnItems.find((t) => t.custId === s.custId) ??
                  defaultSalesItem
              );
              setCustomer(
                customers.find((t) => t.id === s.custId) ?? defaultCustomer
              );
              setPopup("return");
            }}
            key={`refund-${s.id}`}
            disabled={
              s.qty -
                (returnItems.find((t) => t.custId === s.custId)?.qty ?? 0) ===
              0
            }
          >
            <SalesRefundItem
              quantity={
                s.qty -
                (returnItems.find((t) => t.custId === s.custId)?.qty ?? 0)
              }
              claimed={s.claimed}
              price={s.unitAmount}
              paymentStatus={
                customers.find((t) => t.id === s.custId)?.paymentStatus ??
                "not paid"
              }
              customerName={
                customers.find((t) => t.id === s.custId)?.name ?? ""
              }
              custId={s.custId}
              dateTransacted={
                customers.find((t) => t.id === s.custId)?.dateTransacted ?? ""
              }
              discountSales={
                customers.find((t) => t.id === s.custId)?.discountSales ?? 0
              }
            />
          </TouchableOpacity>
        ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  laborItems: {
    backgroundColor: "lightcyan",
    marginTop: 60,
  },
});
