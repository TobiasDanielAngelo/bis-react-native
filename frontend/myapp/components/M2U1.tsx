import { StyleSheet, View } from "react-native";
import { Icon, Text } from "react-native-elements";
import { winWidth } from "../constants/constants";

export const MenuItem = (props: {
  logoName: string;
  label: string;
  selected: boolean;
}) => {
  return (
    <View
      style={[
        styles.fcnBtns,
        {
          width: winWidth / 3,
          backgroundColor: props.selected ? "darkcyan" : "teal",
        },
      ]}
    >
      <Icon name={props.logoName} size={30} color={"white"} />
      <Text style={styles.text}>{props.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  fcnBtns: {
    paddingTop: 5,
    height: 60,
  },
  text: { textAlign: "center", color: "white" },
});
