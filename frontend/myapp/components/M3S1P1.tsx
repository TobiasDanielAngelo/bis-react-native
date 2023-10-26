import { Icon, Overlay } from "react-native-elements";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { useContext, useState, useEffect } from "react";
import { M3S1Context, PurchaseOrder } from "../constants/interfaces";
import { useStore } from "../stores/Store";
import { suppliers } from "../constants/constants";

export const PurchaseOrderModal = (props: {}) => {
  const { popup, setPopup, setOrders, setOrder } = useContext(M3S1Context);
  const { transactionStore, categoryStore } = useStore();
  const [supplier, setSupplier] = useState("");
  const [index, setIndex] = useState(0);

  const onCreateOrder = async () => {
    const resp = await transactionStore.addTransaction({
      category: categoryStore.categoryId("Purchase Parts") ?? "-1",
      description: `ORD #, Editing, Idle, C#0000000, ${new Date().toISOString()}`,
      transmitter: "DATS",
      receiver: supplier.toUpperCase(),
      particular_transaction: [],
    });

    setOrders((prev: PurchaseOrder[]) => [
      ...prev,
      {
        id: parseInt(resp.data?.pk ?? "-1"),
        check: 0,
        dueDate: new Date().toDateString(),
        creationDate: new Date().toDateString(),
        supplier: supplier,
        status: "editing",
        toPrint: false,
      },
    ]);

    setOrder(parseInt(resp.data?.pk ?? "-1"));
    setPopup("");
    setSupplier("");
  };

  useEffect(() => {
    setSupplier(suppliers[index]);
  }, [index]);

  return (
    <Overlay
      isVisible={popup === "order"}
      onBackdropPress={() => {
        setSupplier("");
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
          <Text style={{ fontSize: 16 }}>Create a Purchase Order</Text>
          <Icon
            name={"close"}
            size={30}
            color={"gainsboro"}
            onPress={() => {
              setSupplier("");
              setPopup("");
            }}
          />
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            paddingRight: 20,
          }}
        >
          <Text style={{ fontSize: 20, color: "grey" }}>Supplier</Text>
          <TextInput
            style={{
              marginTop: -5,
              padding: 5,
              borderWidth: 1,
              width: 200,
              borderColor: "gainsboro",
              fontSize: 15,
              height: 40,
            }}
            value={supplier}
            onChangeText={setSupplier}
          />
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
            onPress={onCreateOrder}
          />
          <Icon
            name={"shuffle"}
            size={30}
            color={"gainsboro"}
            onPress={() => {
              if (index < suppliers.length) {
                setIndex((prev) => prev + 1);
              } else {
                setIndex(0);
              }
            }}
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
