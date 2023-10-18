import { useContext, useState } from "react";
import { View } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { Icon } from "react-native-elements";
import {
  M3S3Context,
  PurchaseOrder,
  TransactionUpdateInterface,
} from "../constants/interfaces";
import { useStore } from "../stores/Store";

export const OrderBar = () => {
  const { order, setOrder, orders, setOrders, setSearch, search } =
    useContext(M3S3Context);
  const { transactionStore } = useStore();

  const [open, setOpen] = useState(false);

  const onUpdateOrderStatus = async (status: "delivered" | "processing") => {
    const descDetails = (
      transactionStore.transactionDetails(`${order}`)?.description ?? ""
    ).split(", ");
    descDetails[1] = status.charAt(0).toUpperCase() + status.slice(1);

    setOrders((prev: PurchaseOrder[]) => {
      let targetOrder = prev.find((s) => s.id === order);
      if (targetOrder) targetOrder.status = status;
      return [...prev];
    });

    await transactionStore.updateTransaction(`${order}`, {
      description: descDetails.join(", "),
    } as TransactionUpdateInterface);
  };

  return (
    <View>
      <View
        style={{
          flexDirection: "row",
          marginHorizontal: 10,
          marginVertical: 20,
        }}
      >
        {order === -1 ? (
          <></>
        ) : (
          <Icon
            name={search ? "close" : "search"}
            size={30}
            color={
              orders.find((s) => s.id === order)?.status !== "delivered"
                ? "gray"
                : "teal"
            }
            onPress={() => setSearch((prev) => !prev)}
            disabled={
              orders.find((s) => s.id === order)?.status !== "delivered"
            }
            disabledStyle={{ backgroundColor: "lightcyan" }}
          />
        )}
        <View style={{ flex: 1, marginHorizontal: 10 }}>
          <DropDownPicker
            items={orders.map((s) => ({
              label: `PO#${s.id} - (${s.status})`,
              value: s.id,
              icon: () => <></>,
            }))}
            multiple={false}
            setValue={setOrder}
            value={order}
            open={open}
            setOpen={setOpen}
            textStyle={{
              fontSize: 15,
            }}
            style={{
              height: 35,
              borderColor: "#ddd",
              borderRadius: 0,
              flex: 1,
              minHeight: 35,
              backgroundColor:
                orders.find((s) => s.id === order)?.status === "delivered" ||
                order === -1
                  ? "white"
                  : "#ddd",
            }}
            placeholder="See Orders in Progress..."
            placeholderStyle={{ color: "gray" }}
          />
        </View>
        {order === -1 ? (
          <></>
        ) : orders.find((s) => s.id === order)?.status === "delivered" ? (
          <Icon
            name="undo"
            size={30}
            color={"teal"}
            onPress={() => onUpdateOrderStatus("processing")}
          />
        ) : orders.find((s) => s.id === order)?.status === "closed" ? (
          <></>
        ) : (
          <Icon
            name="local-shipping"
            size={30}
            color={"teal"}
            onPress={() => onUpdateOrderStatus("delivered")}
          />
        )}
      </View>
    </View>
  );
};
