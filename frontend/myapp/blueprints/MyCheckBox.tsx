import { StyleSheet, Text, View } from "react-native";
import { CheckBox } from "react-native-elements";
import { winWidth } from "../constants/constants";

export const MyCheckBox = (props: {
  hidden?: boolean;
  isSelected: boolean;
  setSelection: (t: boolean | ((u: boolean) => boolean)) => void;
  title: string;
  color?: string;
}) => {
  const { hidden, isSelected, setSelection, title, color } = props;

  return (
    !hidden && (
      <View style={styles.main}>
        <Text>{title}</Text>
        <CheckBox
          checked={isSelected}
          style={styles.checkbox}
          onPress={() => setSelection((prev) => !prev)}
          containerStyle={[
            styles.container,
            { backgroundColor: color ? color : "white" },
          ]}
          checkedColor="teal"
          size={winWidth * 0.07}
        />
      </View>
    )
  );
};
const styles = StyleSheet.create({
  checkbox: {
    alignSelf: "center",
  },
  main: {
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    backgroundColor: "lightcyan",
    margin: 0,
    padding: 0,
    justifyContent: "center",
    flexDirection: "column",
  },
});
