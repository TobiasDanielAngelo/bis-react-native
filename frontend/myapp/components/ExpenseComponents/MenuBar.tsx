import { StyleSheet, TouchableOpacity, View } from "react-native";
import { MenuItem } from "../ExpenseComponents/MenuItem";
import { useContext } from "react";
import { MainContext } from "../../interfaces/interfaces";

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
      <TouchableOpacity onPress={() => props.setView("change")}>
        <MenuItem
          logoName="change-history"
          label="Change"
          selected={props.view === "change"}
        />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => props.setView("receipt")}>
        <MenuItem
          logoName="receipt"
          label="Receipt"
          selected={props.view === "receipt"}
        />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => props.setView("view")}>
        <MenuItem
          logoName="history"
          label="View"
          selected={props.view === "view"}
        />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => props.setView("loans")}>
        <MenuItem
          logoName="payments"
          label="Loans"
          selected={props.view === "loans"}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  functions: {
    height: 60,
    backgroundColor: "#ddd",
    alignItems: "center",
    justifyContent: "flex-start",
    flexDirection: "row",
  },
});
