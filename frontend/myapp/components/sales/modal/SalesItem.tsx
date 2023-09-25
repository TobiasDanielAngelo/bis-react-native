import { useCallback, useContext, useMemo, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { Icon, Overlay } from "react-native-elements";
import { CustomerSalesItem, POSContext } from "../../../constants/interfaces";
import { defaultSalesItem } from "../../../constants/constants";
import { useStore } from "../../../stores/Store";

export const SalesItemModal = (props: {}) => {
  const { particularPOSStore } = useStore();
  const { setSalesItems, setSalesItem, salesItem, customer, popup, setPopup } =
    useContext(POSContext);
  const [qty, setQty] = useState("1");

  const onUpdateSales = useCallback(async () => {
    setSalesItems((prev: CustomerSalesItem[]) => {
      (prev.find((s) => s.id === salesItem.id) ?? defaultSalesItem).qty =
        parseInt(qty);
      return [...prev];
    });
    setSalesItem(defaultSalesItem);
    setPopup("");
    await particularPOSStore.updateParticularPOS(`${salesItem.id}`, {
      quantity: parseInt(qty),
    });
  }, [salesItem, qty]);

  const onDeleteSales = useCallback(async () => {
    setSalesItems((prev: CustomerSalesItem[]) => {
      prev.splice(
        prev.findIndex((s) => s.id === salesItem.id),
        1
      );
      return [...prev];
    });
    setPopup("");
    await particularPOSStore.deleteParticularPOS(`${salesItem.id}`);
  }, [salesItem]);

  const handleChange = useCallback(
    (qty: any) => {
      setQty(
        (isNaN(parseFloat(qty.replace(/[^0-9]/g, "")))
          ? ""
          : qty.replace(/[^0-9]/g, "")
        ).toString()
      );
    },
    [qty]
  );

  return (
    <>
      <Overlay
        isVisible={popup === "update"}
        onBackdropPress={() => setPopup("")}
      >
        <View style={styles.msgBox}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Text style={{ fontSize: 16 }}>Update this Item</Text>
            <Icon
              name={"close"}
              size={30}
              color={"#aaa"}
              onPress={() => setPopup("")}
            />
          </View>
          <Text style={{ fontSize: 16, textAlign: "center" }}>
            {salesItem.itemDescription}
          </Text>

          <View
            style={{
              alignItems: "center",
            }}
          >
            <View
              style={{
                paddingRight: 20,
                width: 100,
              }}
            >
              <Text>Quantity</Text>
              <TextInput
                onChangeText={handleChange}
                value={`${qty}`}
                style={{
                  fontSize: 20,
                  textAlign: "center",
                  borderWidth: 1,
                  borderColor: "#999",
                  width: 100,
                  height: 30,
                }}
                keyboardType="numeric"
              />
            </View>
          </View>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Icon
              name={"delete"}
              size={40}
              color={"#aaa"}
              onPress={onDeleteSales}
            />
            <Icon
              name={"check"}
              size={40}
              color={"#aaa"}
              onPress={onUpdateSales}
            />
          </View>
        </View>
      </Overlay>
    </>
  );
};

const styles = StyleSheet.create({
  msgBox: {
    height: 300,
    width: 300,
    justifyContent: "space-between",
  },
});
