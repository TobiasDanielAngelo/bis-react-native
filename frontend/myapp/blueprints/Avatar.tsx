import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { Icon } from "react-native-elements";
import { winWidth } from "../constants/constants";

export const Avatar = (props: {
  selected?: boolean;
  color?: string;
  label?: string;
  onPress?: () => void;
}) => {
  const { selected, color, label, onPress } = props;

  return (
    <TouchableOpacity style={styles.main} onPress={onPress}>
      <Icon
        name={selected ? "mood" : "account-circle"}
        size={0.125 * winWidth}
        color={!color ? "teal" : color}
      />
      <Text style={styles.text}>{label && label.substring(0, 6)}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  main: {
    alignItems: "center",
  },
  text: {
    color: "teal",
  },
});
