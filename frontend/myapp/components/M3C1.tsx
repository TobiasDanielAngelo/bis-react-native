import { observer } from "mobx-react-lite";
import { useState, useEffect, useCallback } from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import { MenuBar } from "./M3G1";
import { ProductsView } from "./M3S2C1";
import { useStore } from "../stores/Store";
import { OrderView } from "./M3S1C1";
import { InventoryContext, ProductInterface } from "../constants/interfaces";
import {
  defaultProduct,
  defaultProductInterface,
} from "../constants/constants";

export const InventoryModule = observer(({ navigation }: any) => {
  const [view, setView] = useState("order");
  const [mode, setMode] = useState("");
  const [item, setItem] = useState<ProductInterface>(defaultProductInterface);
  const [part, setPart] = useState(-1);
  const [items, setItems] = useState<ProductInterface[]>([]);
  const [product, setProduct] = useState(defaultProduct);
  const [selectedMotors, setSelectedMotors] = useState<number[]>([]);
  const [productInputFocus, setProductInputFocus] = useState(false);

  const values = {
    view: view,
    setView: setView,
    mode: mode,
    setMode: setMode,
    item: item,
    setItem: setItem,
    items: items,
    setItems: setItems,
    part: part,
    setPart: setPart,
    product: product,
    setProduct: setProduct,
    selectedMotors: selectedMotors,
    setSelectedMotors: setSelectedMotors,
  };

  return (
    <InventoryContext.Provider value={values}>
      <SafeAreaView style={styles.all}>
        <View style={styles.body}>
          <OrderView visible={view === "order"} />
          <ProductsView
            visible={view === "products"}
            setProductInputFocus={setProductInputFocus}
          />
        </View>
        <MenuBar
          view={view}
          setView={setView}
          productInputFocus={productInputFocus}
        />
      </SafeAreaView>
    </InventoryContext.Provider>
  );
});

const styles = StyleSheet.create({
  all: {
    flex: 1,
  },
  body: {
    flex: 1,
    justifyContent: "flex-end",
    paddingTop: 25,
    backgroundColor: "lightcyan",
  },
});
