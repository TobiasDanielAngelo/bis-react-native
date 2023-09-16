import { StyleSheet, View } from "react-native";
import { Icon, Text } from "react-native-elements";
import { useContext } from "react";
import { MainContext } from "../../interfaces/interfaces";
import { winWidth } from "../../constants/Constants";

export const MenuItem = (props: {
  logoName: string;
  label: string;
  selected: boolean;
}) => {
  const { currentUser } = useContext(MainContext);

  return (
    <View
      style={[
        styles.fcnBtns,
        {
          width: currentUser.privilege !== "3" ? winWidth / 4 : winWidth / 3,
          backgroundColor: props.selected
            ? "rgb(50,183,169)"
            : "rgb(0,133,119)",
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
    // backgroundColor: "rgb(0,133,119)",
    paddingTop: 5,
    height: 60,
    // borderWidth: 1,
    // borderColor: "#050",
  },
  text: { textAlign: "center", color: "white" },
});
