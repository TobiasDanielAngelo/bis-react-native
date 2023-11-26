import { StyleSheet, Text, TouchableOpacity } from "react-native";

export const MyButton = (props: {
  hidden?: boolean;
  onPress?: () => void;
  label: string;
  color?: string;
  flex?: boolean;
}) => {
  const { hidden, onPress, label, color, flex } = props;
  return (
    !hidden && (
      <TouchableOpacity
        style={[
          styles.main,
          { backgroundColor: color ? color : "teal", flex: flex ? 1 : 0 },
        ]}
        onPress={onPress}
      >
        <Text style={styles.text}>{label}</Text>
      </TouchableOpacity>
    )
  );
};

const styles = StyleSheet.create({
  main: {
    marginVertical: 5,
    marginHorizontal: 10,
    backgroundColor: "teal",
    borderRadius: 30,
  },
  text: { textAlign: "center", color: "white", fontSize: 25 },
});
