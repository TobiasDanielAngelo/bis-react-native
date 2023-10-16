import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import {
  defaultProduct,
  defaultProductInterface,
} from "../constants/constants";
import {
  M3S2Context,
  MotorInterface,
  ProductInterface,
} from "../constants/interfaces";
import { useStore } from "../stores/Store";
import { AddProduct } from "./M3S2C2";
import { UpdateProduct } from "./M3S2C3";
import { ViewProducts } from "./M3S2C4";
import { ModeItems } from "./M3S2G2";

export const ProductsView = (props: any) => {
  const { motorStore } = useStore();
  const [query, setQuery] = useState("");
  const [focus, setFocused] = useState(false);
  const [motors, setMotors] = useState<MotorInterface[]>([]);

  const getMotors = async () => {
    await motorStore.fetchMotors();
    setMotors(motorStore.motors);
  };

  const onQueryChange = useCallback((q: string) => {
    setQuery(q);
  }, []);

  const onFocusChange = useCallback((f: boolean) => {
    setFocused(f);
    props.setProductInputFocus(f);
  }, []);

  useEffect(() => {
    getMotors();
  }, [props.visible]);

  const values = {
    motors: motors,
    focus: focus,
    onFocusChange: onFocusChange,
    onQueryChange: onQueryChange,
    query: query,
  };

  return (
    props.visible && (
      <M3S2Context.Provider value={values}>
        <ModeItems />
        <View style={{ flex: 1 }}>
          <AddProduct />
          <UpdateProduct />
          <ViewProducts />
        </View>
      </M3S2Context.Provider>
    )
  );
};
