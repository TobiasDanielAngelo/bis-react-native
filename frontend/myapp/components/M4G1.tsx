import { StyleSheet, TouchableOpacity, View } from "react-native";
import { MenuItem } from "./G4U1";

export const MenuBar = (props: any) => {
  return (
    <View style={styles.functions}>
      <TouchableOpacity
        onPress={() => props.setView("transfer")}
        style={{ flex: 1 }}
      >
        <MenuItem
          logoName="sync-alt"
          label="Transfer"
          selected={props.view === "transfer"}
        />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => props.setView("report")}
        style={{ flex: 1 }}
      >
        <MenuItem
          logoName="description"
          label="Report"
          selected={props.view === "report"}
        />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => props.setView("accounts")}
        style={{ flex: 1 }}
      >
        <MenuItem
          logoName="account-balance"
          label="Accounts"
          selected={props.view === "accounts"}
        />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => props.setView("forecast")}
        style={{ flex: 1 }}
      >
        <MenuItem
          logoName="timeline"
          label="Forecast"
          selected={props.view === "forecast"}
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
