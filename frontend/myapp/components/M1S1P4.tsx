import { useCallback, useContext, useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { Icon, Overlay } from "react-native-elements";
import { defaultSalesItem } from "../constants/constants";
import { CustomerSalesItem, M1S1Context } from "../constants/interfaces";
import { useStore } from "../stores/Store";

export const SalesItemModal = (props: {}) => {
  const { particularPOSStore } = useStore();
  const { setSalesItems, setSalesItem, salesItem, popup, setPopup } =
    useContext(M1S1Context);
  const [qty, setQty] = useState("1");
  const [maxQty, setMaxQty] = useState(0);

  const getMaxQty = async () => {
    const resp = await particularPOSStore.fetchPOSQuantityOfProduct(
      salesItem.itemId
    );
    setMaxQty(resp.data?.quantity ?? 0);
  };

  // Add a qty limiter

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
    (qty: string) => {
      setQty(
        (isNaN(parseFloat(qty.replace(/[^0-9]/g, "")))
          ? ""
          : parseInt(qty) > maxQty
          ? maxQty.toString()
          : qty.replace(/[^0-9]/g, "")
        ).toString()
      );
    },
    [qty]
  );

  useEffect(() => {
    getMaxQty();
  }, [salesItem]);

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
              color={"gainsboro"}
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
                  borderColor: "grey",
                  width: 100,
                  height: 30,
                }}
                keyboardType="numeric"
              />
              <Text>In Stock: {maxQty}</Text>
            </View>
          </View>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Icon
              name={"delete"}
              size={40}
              color={"gainsboro"}
              onPress={onDeleteSales}
            />
            <Icon
              name={"check"}
              size={40}
              color={"gainsboro"}
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
