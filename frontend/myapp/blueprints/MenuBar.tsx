import { StyleSheet, View } from "react-native";
import { doNothing, winWidth } from "../constants/constants";
import { MenuCard } from "./MenuCard";

export const MenuBar = <
  T extends {
    id: number;
    name: string;
    label: string;
  }
>(props: {
  items: T[];
  hidden?: boolean;
  selectedItem?: T;
  onPressItem?: (item: T) => void;
}) => {
  const { items, hidden, selectedItem, onPressItem } = props;
  return (
    !hidden && (
      <View style={styles.main}>
        {items.map((s) => (
          <MenuCard
            name={s.name}
            label={s.label}
            selected={selectedItem?.id === s.id}
            onPress={() => (onPressItem ? onPressItem(s) : doNothing())}
            key={s.id}
          />
        ))}
      </View>
    )
  );
};

const styles = StyleSheet.create({
  main: {
    height: 0.16 * winWidth,
    backgroundColor: "gainsboro",
    flexDirection: "row",
    justifyContent: "flex-end",
  },
});
