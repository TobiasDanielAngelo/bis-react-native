import { observer } from "mobx-react-lite";
import { useState } from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import { MenuBar } from "./M3G1";
import { ProductsView } from "./M3S2C1";

export const InventoryModule = observer(({ navigation }: any) => {
  const [view, setView] = useState("products");
  const [productInputFocus, setProductInputFocus] = useState(false);

  return (
    <SafeAreaView style={styles.all}>
      <View style={styles.body}>
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
