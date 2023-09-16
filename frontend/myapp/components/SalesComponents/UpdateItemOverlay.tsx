import { useState, useContext, useCallback, useMemo } from "react";
import { Text, View, StyleSheet, TextInput } from "react-native";
import { Button, Icon, Overlay } from "react-native-elements";
import { POSContext } from "../../interfaces/interfaces";

export const UpdateItemOverlay = (props: {
  handleUpdateSubmit: (quantity: number) => void;
  handleDelete: () => void;
  visible: boolean;
  setVisible: (v: boolean) => void;
}) => {
  const { salesItem, items } = useContext(POSContext);
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
        isVisible={props.visible}
        onBackdropPress={() => props.setVisible(false)}
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
              onPress={() => props.setVisible(false)}
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
              {/* <ScrollPicker
                dataSource={Array.from(Array(100), (_, index) => index + 1)}
                selectedIndex={0}
                renderItem={(data, index, isSelected) => (
                  <Text
                    style={{
                      color: isSelected ? "black" : "#888",
                      fontSize: 18,
                    }}
                  >
                    {data}
                  </Text>
                )}
                onValueChange={(data) => {
                  handleChange(data);
                }}
                wrapperHeight={100}
                wrapperBackground="white"
                itemHeight={30}
                highlightColor="#d8d8d8"
                highlightBorderWidth={2}
              /> */}
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
                // setName("");
                props.setVisible(false);
              }}
            />
            <Icon
              name={"check"}
              size={40}
              color={"#aaa"}
              onPress={() => {
                props.handleUpdateSubmit(parseInt(qty));
                // setName("");
                props.setVisible(false);
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
