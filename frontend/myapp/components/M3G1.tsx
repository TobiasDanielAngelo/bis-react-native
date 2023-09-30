import { StyleSheet, TouchableOpacity, View } from "react-native";
import { MenuItem } from "./G4U1";

export const MenuBar = (props: any) => {
  return (
    <View style={[styles.functions]}>
      <TouchableOpacity
        onPress={() => props.setView("order")}
        style={{ flex: 1 }}
      >
        <MenuItem
          logoName="add-shopping-cart"
          label="Order"
          selected={props.view === "order"}
        />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => props.setView("products")}
        style={{ flex: 1 }}
      >
        <MenuItem
          logoName="category"
          label="Products"
          selected={props.view === "products"}
        />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => props.setView("delivery")}
        style={{ flex: 1 }}
      >
        <MenuItem
          logoName="local-shipping"
          label="Delivery"
          selected={props.view === "delivery"}
        />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => props.setView("check")}
        style={{ flex: 1 }}
      >
        <MenuItem
          logoName="fact-check"
          label="Check"
          selected={props.view === "check"}
        />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => props.setView("history")}
        style={{ flex: 1 }}
      >
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
