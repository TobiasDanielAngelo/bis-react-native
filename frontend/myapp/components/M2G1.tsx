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
      <TouchableOpacity onPress={() => props.setView("category")}>
        <MenuItem
          logoName="category"
          label="Categorized"
          selected={props.view === "category"}
        />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => props.setView("history")}>
        <MenuItem
          logoName="history"
          label="History"
          selected={props.view === "history"}
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
