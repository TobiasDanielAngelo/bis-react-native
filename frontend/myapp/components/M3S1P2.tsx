import { Icon, Overlay } from "react-native-elements";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { useContext, useState, useMemo, useEffect } from "react";
import { M3S1Context, PurchaseOrder } from "../constants/interfaces";
import { useStore } from "../stores/Store";

export const DeleteOrderModal = (props: {}) => {
  const { popup, setPopup, setOrders, setOrder, order } =
    useContext(M3S1Context);
  const { transactionStore, categoryStore } = useStore();
  const [answer, setAnswer] = useState("");

  const onDeleteOrder = async () => {
    if (answer === `PO${order}`) {
      await transactionStore.deleteTransaction(order.toString());
      setOrders((prev: PurchaseOrder[]) => {
        prev.splice(
          prev.findIndex((s) => s.id === order),
          1
        );
        return [...prev];
      });
      setPopup("");
      setOrder(-1);
    }
  };

  useEffect(() => {
    setAnswer("");
  }, [popup]);

  return (
    <Overlay
      isVisible={popup === "deleteOrder"}
      onBackdropPress={() => {
        setAnswer("");
        setPopup("");
      }}
    >
      <View style={styles.msgBox}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Text style={{ fontSize: 16 }}>Delete this Order?</Text>
          <Icon
            name={"close"}
            size={30}
            color={"gainsboro"}
            onPress={() => {
              setPopup("");
            }}
          />
        </View>
        <View
          style={{
            // flexDirection: "row",
            alignItems: "center",
            // justifyContent: "space-between",
            paddingRight: 20,
          }}
        >
          <Text
            style={{
              marginTop: -5,
              padding: 5,
              width: 200,
              borderColor: "gainsboro",
              fontSize: 20,
              height: 40,
              fontFamily: "monospace",
              textAlign: "center",
            }}
          >
            {`Prompt: *PO${order}*`}
          </Text>
          <TextInput
            style={{
              marginTop: -5,
              padding: 5,
              borderWidth: 1,
              width: 220,
              borderColor: "gainsboro",
              fontSize: 17,
              height: 40,
              textAlign: "center",
            }}
            value={answer}
            onChangeText={setAnswer}
            placeholder="Retype Prompt without *"
          />
        </View>

        <View style={{ flexDirection: "row-reverse" }}>
          <Icon
            name={"check"}
            size={40}
            color={"gainsboro"}
            onPress={onDeleteOrder}
          />
        </View>
      </View>
    </Overlay>
  );
};

const styles = StyleSheet.create({
  msgBox: {
    height: 200,
    width: 300,
    justifyContent: "space-between",
  },
});
