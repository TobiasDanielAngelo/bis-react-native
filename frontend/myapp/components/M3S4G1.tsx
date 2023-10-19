import { useContext, useState } from "react";
import { View } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { Icon } from "react-native-elements";
import { M3S4Context } from "../constants/interfaces";
import { useStore } from "../stores/Store";

export const CheckBar = () => {
  const {} = useContext(M3S4Context);
  const { transactionStore } = useStore();
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
          color={"teal"}
          onPress={() => {}}
          disabled={false}
          disabledStyle={{ backgroundColor: "lightcyan" }}
        />
        <View style={{ flex: 1, marginHorizontal: 10 }}>
          <DropDownPicker
            items={"abcdefghijklmnopqrstuvwxyz"
              .toUpperCase()
              .split("")
              .map((s) => ({
                label: `Shelf ${s} - 2023-10-01`,
                value: s,
                icon: () => <></>,
              }))}
            multiple={false}
            setValue={() => {}}
            value={"A"}
            open={open}
            setOpen={setOpen}
            textStyle={{
              fontSize: 15,
              fontFamily: "monospace",
            }}
            style={{
              height: 35,
              borderColor: "#ddd",
              borderRadius: 0,
              flex: 1,
              minHeight: 35,
            }}
            placeholder="See itemizations in progress..."
            placeholderStyle={{ color: "gray" }}
          />
        </View>
        <Icon name="check" size={30} color={"teal"} onPress={() => {}} />
      </View>
    </View>
  );
};
