import { useState, useContext, useCallback, useMemo } from "react";
import { Text, View, StyleSheet, TextInput } from "react-native";
import { Button, Icon, Overlay } from "react-native-elements";
import { POSContext } from "../../interfaces/interfaces";

export const UpdateItemOverlay = (props: {
  handleUpdateSubmit: (quantity: number) => void;
  handleDelete: () => void;
}) => {
  const { salesItem, items, popup, setPopup } = useContext(POSContext);
  const [qty, setQty] = useState("1");

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

  const itemName = useMemo(
    () => items.find((s) => s.id === salesItem)?.name ?? "",
    [items, salesItem]
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
          <Text style={{ fontSize: 16, textAlign: "center" }}>{itemName}</Text>

          <View
            style={{
              alignItems: "center",
            }}
          >
            <View
              style={{
                // flexDirection: "c",
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
              onPress={() => {
                props.handleDelete();
                setPopup("");
              }}
            />
            <Icon
              name={"check"}
              size={40}
              color={"#aaa"}
              onPress={() => {
                props.handleUpdateSubmit(parseInt(qty));
                setPopup("");
              }}
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
