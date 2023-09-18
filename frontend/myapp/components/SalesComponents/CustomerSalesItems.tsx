import { StyleSheet, TouchableOpacity, Text } from "react-native";
import { useContext } from "react";
import { SalesPOSItem } from "./SalesPOSItem";
import { POSContext } from "../../interfaces/interfaces";

export const CustomerSalesItems = (props: {
  setSalesItem: (salesItem: number) => void;
  toggleClaimed: (itemId: number, claimed: boolean) => void;
}) => {
  const { customer, salesItems, items, paymentStatus, focused, setPopup } =
    useContext(POSContext);

  return (
    <>
      {!focused && (
        <>
          <Text
            style={{
              margin: 10,
              fontSize: 20,
              display:
                salesItems.filter((s) => s.custId === customer).length !== 0
                  ? "flex"
                  : "none",
            }}
          >
            Sales
          </Text>
          {salesItems
            .filter((s) => s.custId === customer)
            .map((s) => items.find((t) => t.id === s.itemId))
            .map((s) => (
              <TouchableOpacity
                onPress={() => {
                  if (paymentStatus === "not paid") {
                    setPopup("update");
                    props.setSalesItem(s?.id ?? -1);
                  }
                }}
                key={`sales-${s?.id}-${customer}`}
                onLongPress={() => {
                  props.toggleClaimed(
                    s?.id ?? -1,
                    !(
                      salesItems.find(
                        (t) => t.custId === customer && t.itemId === s?.id
                      )?.claimed ?? false
                    )
                  );
                }}
              >
                <SalesPOSItem
                  quantity={
                    salesItems.find(
                      (t) => t.custId === customer && t.itemId === s?.id
                    )?.qty ?? 1
                  }
                  description={s?.name ?? ""}
                  claimed={
                    salesItems.find(
                      (t) => t.custId === customer && t.itemId === s?.id
                    )?.claimed ?? false
                  }
                  price={s?.price ?? 0}
                  paymentStatus={paymentStatus}
                />
              </TouchableOpacity>
            ))}
        </>
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
});
