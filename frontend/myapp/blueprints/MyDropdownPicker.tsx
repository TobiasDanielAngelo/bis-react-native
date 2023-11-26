import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import DropDownPicker, {
  ItemType,
  ValueType,
} from "react-native-dropdown-picker";
import { winWidth } from "../constants/constants";

export const MyDropdownPicker = <T extends ValueType>(props: {
  value: T;
  setValue: (t: T) => void;
  items: ItemType<T>[];
  label?: string;
  flex?: boolean;
  disabled?: boolean;
  hidden?: boolean;
}) => {
  const { items, value, setValue, label, flex, hidden, disabled } = props;

  const [open, setOpen] = useState(false);

  return (
    !hidden && (
      <View style={[styles.main, { flex: flex ? 1 : 0 }]}>
        {label && <Text>{label}</Text>}
        <DropDownPicker
          items={items}
          multiple={false}
          setValue={(t: any) => setValue(t())}
          value={value}
          open={open}
          setOpen={setOpen}
          textStyle={{
            fontSize: (1 / 20) * winWidth,
          }}
          searchable={true}
          searchPlaceholder="Search..."
          listMode="MODAL"
          disabled={disabled}
          placeholder={label}
        />
      </View>
    )
  );
};

const styles = StyleSheet.create({
  main: {
    margin: 3,
  },
});
