import { Overlay } from "react-native-elements";
import { View, Text } from "react-native";
import { useContext } from "react";
import { M3S1Context } from "../constants/interfaces";

export const PurchaseOrderModal = (props: {}) => {
  const { popup, setPopup } = useContext(M3S1Context);

  return (
    <Overlay isVisible={popup === "order"} onBackdropPress={() => setPopup("")}>
      <View>
        <Text>Hello</Text>
      </View>
    </Overlay>
  );
};
