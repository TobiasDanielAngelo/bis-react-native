import { Text, View, Pressable } from "react-native";
import { ProductForm } from "./M3S2P1";
import { ProductListMatches } from "./M3S2G1";
import { Icon } from "react-native-elements";
import { useState, useEffect } from "react";
import { M3S2Context } from "../constants/interfaces";

const ModeItem = (props: {
  title: string;
  logo: string;
  selected: boolean;
  onPress: () => void;
  isLarge: boolean;
}) => {
  return (
    <Pressable style={{ flex: 1, padding: 10 }} onPress={props.onPress}>
      <Icon
        name={props.logo}
        size={props.isLarge ? 50 : 25}
        color={props.selected || props.isLarge ? "teal" : "lightblue"}
      />
      <Text
        style={{
          textAlign: "center",
          color: props.selected || props.isLarge ? "teal" : "lightblue",
          fontSize: props.isLarge ? 13 : 10,
        }}
      >
        {props.title}
      </Text>
    </Pressable>
  );
};

export const ProductsView = (props: { visible: boolean }) => {
  const [mode, setMode] = useState("");

  const modes = ["create", "uPrice", "uLocation", "uMotors"];

  useEffect(() => {
    setMode("");
  }, [props.visible]);

  const values = {};

  return (
    props.visible && (
      <M3S2Context.Provider value={values}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row" }}>
            <ModeItem
              title="Create"
              logo="add"
              selected={mode === modes[0]}
              onPress={() => setMode(modes[0])}
              isLarge={mode === ""}
            />
            <ModeItem
              title="Update Price"
              logo="payments"
              selected={mode === modes[1]}
              onPress={() => setMode(modes[1])}
              isLarge={mode === ""}
            />
            <ModeItem
              title="Update Location"
              logo="location-on"
              selected={mode === modes[2]}
              onPress={() => setMode(modes[2])}
              isLarge={mode === ""}
            />
            <ModeItem
              title="Update Motors"
              logo="motorcycle"
              selected={mode === modes[3]}
              onPress={() => setMode(modes[3])}
              isLarge={mode === ""}
            />
            {mode !== "" && (
              <ModeItem
                title="Cancel"
                logo="close"
                selected={false}
                onPress={() => setMode("")}
                isLarge={mode === ""}
              />
            )}
          </View>
          <ProductListMatches visible={mode === "create"} />
          <ProductForm mode={mode} />
        </View>
      </M3S2Context.Provider>
    )
  );
};
