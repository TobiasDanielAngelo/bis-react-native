import { StyleSheet, TouchableOpacity } from "react-native";
import { MyIcon } from "./MyIcon";

export const MenuCard = (props: {
  name: string;
  label: string;
  selected?: boolean;
  onPress?: () => void;
}) => {
  const { name, label, selected, onPress } = props;
  return (
    <TouchableOpacity
      style={[
        styles.main,
        {
          backgroundColor: selected ? "lightseagreen" : "teal",
        },
      ]}
      onPress={onPress}
    >
      <MyIcon
        name={name}
        size="small"
        color={"white"}
        label={label}
        uncut
        onPress={onPress}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  main: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  text: { color: "white" },
});
