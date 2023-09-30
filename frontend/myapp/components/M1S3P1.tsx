import { useCallback, useContext, useEffect, useState, useMemo } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { Icon, Overlay } from "react-native-elements";
import { CustomerSalesItem, M1S3Context } from "../constants/interfaces";
import { useStore } from "../stores/Store";
import { defaultSalesItem } from "../constants/constants";

export const ReturnItemModal = (props: {}) => {
  const [qty, setQty] = useState("0");
  const {
    popup,
    setPopup,
    setReturnItems,
    returnItems,
    returnItem,
    salesItem,
    customer,
  } = useContext(M1S3Context);
  const { particularPOSStore } = useStore();

  const maxQty = useMemo(
    () => salesItem.qty - returnItem.qty,
    [salesItem, returnItem, returnItems]
  );

  const onUpdateSales = useCallback(async () => {
    if (
      !returnItems.some(
        (s) => s.custId === customer.id && s.itemId === salesItem.id
      ) &&
      returnItem.id !== -1 &&
      returnItem.id
    ) {
      setReturnItems((prev: CustomerSalesItem[]) => {
        (prev.find((s) => s.id === returnItem.id) ?? defaultSalesItem).qty =
          returnItem.qty + parseInt(qty);
        return [...prev];
      });

      await particularPOSStore.updateParticularPOS(`${returnItem.id}`, {
        remarks: `Returned ${new Date().toString()}`,
        quantity: returnItem.qty,
      });
    } else {
      const resp = await particularPOSStore.addParticularPOS(
        {
          remarks: `Returned ${new Date().toString()}`,
          description: `RSI${salesItem.itemId}***${salesItem.itemDescription}`,
          quantity: parseInt(qty),
          unit_amount: salesItem.unitAmount,
        },
        customer.id
      );
      setReturnItems((prev: CustomerSalesItem[]) => {
        return [
          ...prev,
          {
            id: parseInt(resp.data?.id ?? "-1"),
            itemId: salesItem.id,
            itemDescription: salesItem.itemDescription,
            custId: customer.id,
            unitAmount: salesItem.unitAmount,
            qty: parseInt(qty),
            claimed: true,
          },
        ];
      });
    }
  }, [customer, salesItem, returnItems, returnItem, qty]);

  const handleChange = useCallback(
    (qty: any) => {
      setQty(
        (isNaN(parseFloat(qty.replace(/[^0-9]/g, "")))
          ? ""
          : qty.replace(/[^0-9]/g, "")
        ).toString()
      );
      if (maxQty < parseInt(qty)) {
        setQty(maxQty.toString());
      }
    },
    [qty]
  );

  useEffect(() => {
    setQty("0");
  }, [popup]);

  return (
    <>
      <Overlay
        isVisible={popup === "return"}
        onBackdropPress={() => setPopup("")}
      >
        <View style={styles.msgBox}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Text style={{ fontSize: 16 }}>Return an Item</Text>
            <Icon
              name={"close"}
              size={30}
              color={"gainsboro"}
              onPress={() => setPopup("")}
            />
          </View>

          <View
            style={{
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: 200,
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 18, margin: 10 }}>
                How many returned?
              </Text>
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
            </View>
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
              color={"gainsboro"}
              onPress={() => {
                if (parseInt(qty) > 0 && parseInt(qty) <= maxQty) {
                  onUpdateSales();
                }
                setPopup("");
              }}
            />
            <Icon
              name={"select-all"}
              size={40}
              color={"gainsboro"}
              onPress={() => setQty(`${maxQty}`)}
            />
          </View>
        </View>
      </Overlay>
    </>
  );
};

const styles = StyleSheet.create({
  msgBox: {
    height: 200,
    width: 300,
    justifyContent: "space-between",
  },
});
