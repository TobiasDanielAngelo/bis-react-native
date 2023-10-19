import { Text } from "react-native";
import { M3S4Context } from "../constants/interfaces";
import { CheckBar } from "./M3S4G1";
import { ProductsPlaced } from "./M3S4G2";

export const CheckView = (props: { visible: boolean }) => {
  const values = {};

  return (
    props.visible && (
      <M3S4Context.Provider value={values}>
        <CheckBar />
        <ProductsPlaced />
      </M3S4Context.Provider>
    )
  );
};
