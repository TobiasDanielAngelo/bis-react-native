import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { Icon } from "react-native-elements";
import { doNothing, winWidth } from "../constants/constants";

export const MyIcon = (props: {
  name: string;
  onPress?: () => void;
  onLongPress?: () => void;
  size?: "small" | "medium" | "large";
  color?: string;
  label?: string;
  hidden?: boolean;
  disabled?: boolean;
  uncut?: boolean;
  noLabel?: boolean;
}) => {
  const {
    uncut,
    name,
    onPress,
    onLongPress,
    color,
    label,
    size,
    disabled,
    noLabel,
    hidden,
  } = props;

  let multiplier = 0;

  switch (size) {
    case "small":
      multiplier = 1 / 12;
      break;
    case "medium":
      multiplier = 1 / 8;
      break;
    case "large":
      multiplier = 1 / 4;
      break;
    default:
      multiplier = 1 / 8;
      break;
  }

  return (
    !hidden && (
      <TouchableOpacity
        style={styles.main}
        onPress={!disabled ? onPress : doNothing}
        onLongPress={!disabled ? onPress : doNothing}
      >
        <Icon
          name={name}
          size={multiplier * winWidth}
          color={!color ? (disabled ? "#ddd" : "teal") : color}
        />
        {!noLabel && (
          <Text style={[styles.text, { color: color }]}>
            {label && (uncut ? label : label.substring(0, 6))}
          </Text>
        )}
      </TouchableOpacity>
    )
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
