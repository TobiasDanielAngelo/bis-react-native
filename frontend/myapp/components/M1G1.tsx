import { useContext } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { MainContext } from "../constants/interfaces";
import { MenuItem } from "./G4U1";

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
      <TouchableOpacity
        onPress={() => props.setView("transact")}
        style={{ flex: 1 }}
      >
        <MenuItem
          logoName="point-of-sale"
          label="Transact"
          selected={props.view === "transact"}
        />
      </TouchableOpacity>
      {currentUser.privilege !== "3" && (
        <TouchableOpacity
          onPress={() => props.setView("compensate")}
          style={{ flex: 1 }}
        >
          <MenuItem
            logoName="home-repair-service"
            label="Compensate"
            selected={props.view === "compensate"}
          />
        </TouchableOpacity>
      )}
      <TouchableOpacity
        onPress={() => props.setView("return")}
        style={{ flex: 1 }}
      >
        <MenuItem
          logoName="assignment-return"
          label="Return"
          selected={props.view === "return"}
        />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => props.setView("view")}
        style={{ flex: 1 }}
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
    backgroundColor: "gainsboro",
    alignItems: "center",
    justifyContent: "flex-start",
    flexDirection: "row",
  },
});
