import { useContext, useState } from "react";
import { View } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { Icon } from "react-native-elements";
import { M3S1Context } from "../constants/interfaces";

export const OrderBar = () => {
  const { order, setOrder, orders, setPopup, viewProducts } =
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
              label: `PO#${s.id} - ${s.supplier}`,
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
              // backgroundColor: viewProducts ? "#ddd" : "white",
            }}
            placeholder="See Orders in Progress..."
            placeholderStyle={{ color: "gray" }}
            // disabled={viewProducts}
          />
        </View>
        <Icon
          name="delete"
          size={30}
          color={order === -1 ? "gray" : "teal"}
          onPress={() => order !== -1 && setPopup("order")}
        />
      </View>
    </View>
  );
};
