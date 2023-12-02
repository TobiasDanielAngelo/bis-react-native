import { Text } from "react-native";
import { winWidth } from "../constants/constants";

export const MyText = (props: {
  hidden?: boolean;
  size?: "medium" | "large";
  text?: string | number;
  error?: boolean;
  success?: boolean;
  highlight?: boolean;
  onPress?: () => void;
  align?: "center" | "right";
}) => {
  const { highlight, text, hidden, size, error, success, onPress, align } =
    props;
  return (
    !hidden && (
      <Text
        style={{
          fontSize: size
            ? winWidth * 0.05
            : size === "medium"
            ? winWidth * 0.06
            : winWidth * 0.07,
          color: error ? "darkred" : success ? "green" : undefined,
          fontWeight: highlight ? "bold" : "normal",
          textAlign: align,
        }}
        onPress={onPress}
      >
        {text}
      </Text>
    )
  );
};
