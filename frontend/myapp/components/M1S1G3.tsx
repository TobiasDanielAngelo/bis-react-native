import { useCallback, useContext } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { defaultSalesItem } from "../constants/constants";
import { CustomerSalesItem, M1S1Context } from "../constants/interfaces";
import { useStore } from "../stores/Store";
import { SalesPOSItem } from "./M1S1U3";

export const CustomerSalesItems = (props: {}) => {
  const { particularPOSStore } = useStore();
  const { customer, salesItems, focus, setPopup, setSalesItem, setSalesItems } =
    useContext(M1S1Context);

  const toggleClaimed = useCallback(
    async (id: number, claimed: boolean) => {
      setSalesItems((prev: CustomerSalesItem[]) => {
        (prev.find((s) => s.id === id) ?? defaultSalesItem).claimed = claimed;
        return [...prev];
      });

      await particularPOSStore.updateParticularPOS(`${id}`, {
        remarks: claimed ? `Claimed ${new Date().toISOString()}` : "",
      });
    },
    [salesItems]
  );

  return (
    <>
      {!focus && (
        <View>
          <Text
            style={{
              margin: 10,
              fontSize: 20,
              display:
                salesItems.filter((s) => s.custId === customer?.id).length !== 0
                  ? "flex"
                  : "none",
            }}
          >
            Sales
          </Text>

          {salesItems
            .filter((s) => s.custId === customer.id)
            .map((s) => (
              <TouchableOpacity
                onPress={() => {
                  if (customer.paymentStatus === "not paid") {
                    setSalesItem(s);
                    setPopup("update");
                  }
                }}
                key={`sales-${s?.itemId}-${customer.id}`}
                onLongPress={() => {
                  toggleClaimed(
                    s?.id ?? -1,
                    !(salesItems.find((t) => t.id === s?.id)?.claimed ?? false)
                  );
                }}
              >
                <SalesPOSItem
                  quantity={
                    salesItems.find(
                      (t) => t.custId === customer.id && t.itemId === s?.itemId
                    )?.qty ?? 1
                  }
                  description={s.itemDescription}
                  claimed={
                    salesItems.find(
                      (t) => t.custId === customer.id && t.itemId === s?.itemId
                    )?.claimed ?? false
                  }
                  price={s.unitAmount ?? 0}
                  paymentStatus={customer.paymentStatus}
                />
              </TouchableOpacity>
            ))}
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({});
