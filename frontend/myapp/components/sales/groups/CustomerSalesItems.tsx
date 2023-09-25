import { useCallback, useContext } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { CustomerSalesItem, POSContext } from "../../../constants/interfaces";
import { useStore } from "../../../stores/Store";
import { SalesPOSItem } from "../units/SalesPOSItem";
import { defaultSalesItem } from "../../../constants/constants";

export const CustomerSalesItems = (props: {}) => {
  const { particularPOSStore } = useStore();
  const { customer, salesItems, focus, setPopup, setSalesItem, setSalesItems } =
    useContext(POSContext);

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

const styles = StyleSheet.create({
  scrollQueue: {
    height: 65,
  },
  customerQueue: {
    flexDirection: "row",
    backgroundColor: "rgb(208,224,227)",
    zIndex: -1,
  },
  selectedAvatar: {
    marginTop: 1,
    marginHorizontal: 0,
  },

  avatar: {
    marginTop: 4,
    marginHorizontal: 5,
  },
  customerItems: {
    backgroundColor: "rgb(208,224,227)",
    paddingTop: 10,
    marginTop: 60,
  },
});
