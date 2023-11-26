import { useCallback } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ItemType, ValueType } from "react-native-dropdown-picker";
import { winWidth } from "../constants/constants";
import {
  moveItemToFirstFromListState,
  popItemFromListState,
} from "../constants/helpers";

export const MyQuickList = <T extends ValueType>(props: {
  hidden?: boolean;
  values: number[];
  items: ItemType<T>[];
  setValues: (t: number[] | ((u: number[]) => number[])) => void;
  editable?: boolean;
}) => {
  const { hidden, setValues, values, items, editable } = props;

  const removeValue = useCallback(
    (id: number) => {
      popItemFromListState(id, setValues);
    },
    [values]
  );

  const moveValueToFirst = useCallback(
    (id: number) => {
      moveItemToFirstFromListState(id, setValues);
    },
    [values]
  );

  return (
    !hidden && (
      <View style={styles.main}>
        {values.map((s) => (
          <View style={styles.item} key={s.toString()}>
            <Text
              style={styles.text}
              onPress={() => removeValue(s)}
              onLongPress={() => moveValueToFirst(s)}
              disabled={!editable}
            >
              {items.find((t) => t.value === s)?.label}
              {editable && ` \u00d7`}
            </Text>
          </View>
        ))}
      </View>
    )
  );
};

const styles = StyleSheet.create({
  main: {
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
