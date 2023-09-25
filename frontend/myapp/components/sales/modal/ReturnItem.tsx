import { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { Icon, Overlay } from "react-native-elements";

export const ReturnItemModal = (props: {
  handleReturnSubmit: (quantity: number) => void;
  visible: boolean;
  setVisible: (v: boolean) => void;
  maxQty: number;
}) => {
  const [qty, setQty] = useState("0");

  const handleChange = useCallback(
    (qty: any) => {
      setQty(
        (isNaN(parseFloat(qty.replace(/[^0-9]/g, "")))
          ? ""
          : qty.replace(/[^0-9]/g, "")
        ).toString()
      );
      if (props.maxQty < parseInt(qty)) {
        setQty(props.maxQty.toString());
      }
    },
    [qty]
  );

  useEffect(() => {
    setQty("0");
  }, [props.visible]);

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
            <Text style={{ fontSize: 16 }}>
              Return certain amount of items:
            </Text>
            <Icon
              name={"close"}
              size={30}
              color={"#aaa"}
              onPress={() => props.setVisible(false)}
            />
          </View>

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
            style={{
              flexDirection: "row-reverse",
              justifyContent: "space-between",
            }}
          >
            <Icon
              name={"check"}
              size={40}
              color={"#aaa"}
              onPress={() => {
                if (parseInt(qty) > 0 && parseInt(qty) <= props.maxQty) {
                  props.handleReturnSubmit(parseInt(qty));
                  // setName("");
                }
                props.setVisible(false);
              }}
            />
            <Icon
              name={"select-all"}
              size={40}
              color={"#aaa"}
              onPress={() => setQty(`${props.maxQty}`)}
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
