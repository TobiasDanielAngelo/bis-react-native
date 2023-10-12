import { useContext } from "react";
import { View } from "react-native";
import {
  defaultPOSItem,
  defaultProduct,
  defaultProductInterface,
} from "../constants/constants";
import { M3S2Context } from "../constants/interfaces";
import { ModeItem } from "./M3S2U1";

export const ModeItems = (props: {}) => {
  const modes = ["create", "update", "view"];
  const { mode, setMode, setPart, setProduct, setSelectedMotors, setItem } =
    useContext(M3S2Context);

  const clearSelection = () => {
    setSelectedMotors([]);
    setProduct(defaultProduct);
    setPart(-1);
    setItem(defaultProductInterface);
  };

  return (
    <View style={{ flexDirection: "row" }}>
      {mode !== "" && (
        <ModeItem
          title="Clear"
          logo="refresh"
          selected={true}
          onPress={clearSelection}
          isLarge={mode === ""}
        />
      )}
      <ModeItem
        title="Create"
        logo="add"
        selected={mode === modes[0]}
        onPress={() => {
          clearSelection();
          setMode(modes[0]);
        }}
        isLarge={mode === ""}
      />
      <ModeItem
        title="Update"
        logo="edit"
        selected={mode === modes[1]}
        onPress={() => {
          clearSelection();
          setMode(modes[1]);
        }}
        isLarge={mode === ""}
      />
      <ModeItem
        title="View"
        logo="view-list"
        selected={mode === modes[2]}
        onPress={() => {
          clearSelection();
          setMode(modes[2]);
        }}
        isLarge={mode === ""}
      />
      {/* <ModeItem
        title="Update Motors"
        logo="motorcycle"
        selected={mode === modes[3]}
        onPress={() => setMode(modes[3])}
        isLarge={mode === ""}
      /> */}
      {mode !== "" && (
        <ModeItem
          title="Cancel"
          logo="close"
          selected={true}
          onPress={() => {
            setMode("");
            setSelectedMotors([]);
            setProduct(defaultProduct);
            setPart(-1);
          }}
          isLarge={mode === ""}
        />
      )}
    </View>
  );
};
