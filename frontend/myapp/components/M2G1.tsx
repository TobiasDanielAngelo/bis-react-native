import { StyleSheet, TouchableOpacity, View } from "react-native";
import { MenuItem } from "./M2U1";

export const MenuBar = (props: any) => {
  return (
    <View style={[styles.functions]}>
      <TouchableOpacity onPress={() => props.setView("quick")}>
        <MenuItem
          logoName="flash-on"
          label="Quick"
          selected={props.view === "quick"}
        />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => props.setView("loans")}>
        <MenuItem
          logoName="payments"
          label="Loans"
          selected={props.view === "loans"}
        />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => props.setView("view")}>
        <MenuItem
          logoName="history"
          label="View"
          selected={props.view === "view"}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  functions: {
    height: 60,
    backgroundColor: "gainsboro",
    alignItems: "center",
    justifyContent: "flex-start",
    flexDirection: "row",
  },
});
