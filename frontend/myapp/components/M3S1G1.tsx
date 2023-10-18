import { useContext, useState } from "react";
import { View, Text } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { Icon } from "react-native-elements";
import { M3S1Context } from "../constants/interfaces";

export const OrderBar = () => {
  const { order, setOrder, orders, setPopup, viewProducts, popup } =
    useContext(M3S1Context);

  const [open, setOpen] = useState(false);

  return (
    <View>
      <View
        style={{
          flexDirection: "row",
          marginHorizontal: 10,
          marginVertical: 20,
        }}
      >
        <Icon
          name="add"
          size={30}
          color="teal"
          onPress={() => setPopup("order")}
        />
        <View style={{ flex: 1, marginHorizontal: 10 }}>
          <DropDownPicker
            items={orders.map((s) => ({
              label: `PO#${s.id} - ${s.supplier} (${s.status})`,
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
                orders.find((s) => s.id === order)?.status === "editing" ||
                order === -1
                  ? "white"
                  : "#ddd",
            }}
            placeholder="See Orders in Progress..."
            placeholderStyle={{ color: "gray" }}
            // disabled={viewProducts}
          />
        </View>
        <Icon
          name="delete"
          size={30}
          color={
            order === -1 ||
            orders.find((s) => s.id === order)?.status !== "editing"
              ? "gray"
              : "teal"
          }
          disabled={orders.find((s) => s.id === order)?.status !== "editing"}
          disabledStyle={{ backgroundColor: "lightcyan" }}
          onLongPress={() => order !== -1 && setPopup("deleteOrder")}
        />
      </View>
    </View>
  );
};
