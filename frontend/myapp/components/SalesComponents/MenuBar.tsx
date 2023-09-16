import { StyleSheet, TouchableOpacity, View } from "react-native";
import { MenuItem } from "./MenuItem";
import { useContext } from "react";
import { MainContext } from "../../interfaces/interfaces";

export const MenuBar = (props: any) => {
  const { currentUser } = useContext(MainContext);

  return (
    <View
      style={[
        styles.functions,
        {
          display:
            props.POSInputFocus || props.refundInputFocus ? "none" : "flex",
        },
      ]}
    >
      <TouchableOpacity onPress={() => props.setView("transact")}>
        <MenuItem
          logoName="point-of-sale"
          label="Transact"
          selected={props.view === "transact"}
        />
      </TouchableOpacity>
      {currentUser.privilege !== "3" && (
        <TouchableOpacity onPress={() => props.setView("compensate")}>
          <MenuItem
            logoName="home-repair-service"
            label="Compensate"
            selected={props.view === "compensate"}
          />
        </TouchableOpacity>
      )}
      <TouchableOpacity onPress={() => props.setView("return")}>
        <MenuItem
          logoName="assignment-return"
          label="Return"
          selected={props.view === "return"}
        />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => props.setView("view")}
        // disabled={currentUser.privilege === "3"}
      >
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
    backgroundColor: "#ddd",
    alignItems: "center",
    justifyContent: "flex-start",
    flexDirection: "row",
  },
});
