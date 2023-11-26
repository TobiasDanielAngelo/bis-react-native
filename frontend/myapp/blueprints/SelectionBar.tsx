import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { doNothing } from "../constants/constants";
import { Avatar } from "./Avatar";
import { MyIcon } from "./MyIcon";

export const SelectionBar = <
  T extends { id: number; name: string; color?: string }
>(props: {
  selectedItem: number;
  items: T[];
  onPressAdd?: () => void;
  onPressRefresh?: () => void;
  onPressItem?: (item: number) => void;
  hasNoAddBtn?: boolean;
  hasNoRefreshBtn?: boolean;
  hidden?: boolean;
}) => {
  const {
    onPressAdd,
    onPressItem,
    onPressRefresh,
    hasNoAddBtn,
    hasNoRefreshBtn,
    items,
    selectedItem,
    hidden,
  } = props;

  const [page, setPage] = useState(0);

  const rowLength = 4 + (hasNoAddBtn ? 1 : 0);
  const leftIndex = page * rowLength;
  const rightIndex = leftIndex + rowLength;

  return (
    !hidden && (
      <View style={styles.main}>
        <View style={styles.left}>
          {!hasNoAddBtn && <MyIcon name="add" onPress={onPressAdd} />}
          <MyIcon
            name="navigate-before"
            onPress={() => setPage((prev) => prev - 1)}
            disabled={page === 0}
          />
          {items.slice(leftIndex, rightIndex).map((s) => (
            <Avatar
              label={s.name}
              key={s.id}
              selected={s.id === selectedItem}
              onPress={() => (onPressItem ? onPressItem(s.id) : doNothing())}
              color={s.color}
            />
          ))}
        </View>
        <View style={styles.right}>
          <MyIcon
            name="navigate-next"
            onPress={() => setPage((prev) => prev + 1)}
            disabled={page === Math.floor(items.length / rowLength)}
          />
          {!hasNoRefreshBtn && (
            <MyIcon name="refresh" onPress={onPressRefresh} />
          )}
        </View>
      </View>
    )
  );
};

const styles = StyleSheet.create({
  main: {
    flexDirection: "row",
    backgroundColor: "lightcyan",
    borderTopWidth: 3,
    borderBottomWidth: 3,
    borderColor: "teal",
  },
  left: {
    flexDirection: "row",
    flex: 1,
  },
  right: {
    flexDirection: "row",
  },
});
