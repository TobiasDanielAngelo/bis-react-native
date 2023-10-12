import { Text, Pressable } from "react-native";
import { Icon } from "react-native-elements";

export const ModeItem = (props: {
  title: string;
  logo: string;
  selected: boolean;
  onPress: () => void;
  isLarge: boolean;
}) => {
  return (
    <Pressable style={{ flex: 1, padding: 10 }} onPress={props.onPress}>
      <Icon
        name={props.logo}
        size={props.isLarge ? 50 : 25}
        color={props.selected || props.isLarge ? "teal" : "lightblue"}
      />
      <Text
        style={{
          textAlign: "center",
          color: props.selected || props.isLarge ? "teal" : "lightblue",
          fontSize: props.isLarge ? 13 : 9,
        }}
      >
        {props.title}
      </Text>
    </Pressable>
  );
};
