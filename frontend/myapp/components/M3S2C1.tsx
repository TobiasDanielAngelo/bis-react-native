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
  const [mode, setMode] = useState("");
  const [part, setPart] = useState(-1);
  const [product, setProduct] = useState(defaultProduct);
  const [selectedMotors, setSelectedMotors] = useState<number[]>([]);
  const [motors, setMotors] = useState<MotorInterface[]>([]);
  const [query, setQuery] = useState("");
  const [focus, setFocused] = useState(false);
  const [item, setItem] = useState<ProductInterface>(defaultProductInterface);
  const [items, setItems] = useState<ProductInterface[]>([]);

  const getMotors = async () => {
    motorStore.deleteMotorHistory();
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
    setMode("");
  }, [props.visible]);

  const values = {
    motors: motors,
    mode: mode,
    setMode: setMode,
    part: part,
    setPart: setPart,
    product: product,
    setProduct: setProduct,
    selectedMotors: selectedMotors,
    setSelectedMotors: setSelectedMotors,
    item: item,
    items: items,
    focus: focus,
    onFocusChange: onFocusChange,
    onQueryChange: onQueryChange,
    query: query,
    setItem: setItem,
    setItems: setItems,
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
