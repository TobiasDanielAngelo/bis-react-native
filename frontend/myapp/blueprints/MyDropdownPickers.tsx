import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import DropDownPicker, {
  ItemType,
  ValueType,
} from "react-native-dropdown-picker";
import { winWidth } from "../constants/constants";
import { MyQuickList } from "./MyQuickList";

export const MyDropdownPickers = <T extends ValueType>(props: {
  values: number[];
  setValues: (t: number[] | ((u: number[]) => number[])) => void;
  items: ItemType<T>[];
  label?: string;
  flex?: boolean;
  disabled?: boolean;
  hidden?: boolean;
}) => {
  const { items, values, setValues, label, flex, hidden, disabled } = props;

  const [open, setOpen] = useState(false);

  return (
    !hidden && (
      <View style={[styles.main, { flex: flex ? 1 : 0 }]}>
        <Text>{label}</Text>
        <DropDownPicker
          items={items}
          multiple={true}
          setValue={setValues}
          value={values}
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
        <MyQuickList
          values={values}
          items={items}
          setValues={setValues}
          hidden={values.length === 0}
          editable
        />
      </View>
    )
  );
};

const styles = StyleSheet.create({
  main: {
    margin: 3,
  },
  list: {
    margin: 5,
    padding: 5,
    flexDirection: "row",
    backgroundColor: "lightblue",
    flexWrap: "wrap",
    borderRadius: 20,
  },
  item: {
    backgroundColor: "lightcyan",
    borderRadius: 20,
    padding: 5,
    margin: 5,
  },
  text: { fontSize: 0.04 * winWidth },
});
