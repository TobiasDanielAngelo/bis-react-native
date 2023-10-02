import { useContext, useEffect, useState } from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import { M3S2Context, ProductInterface } from "../constants/interfaces";
import { useStore } from "../stores/Store";
import { LoadingView } from "./G2C1";
import PagerView from "react-native-pager-view";
import Dots from "react-native-dots-pagination";

export const ProductListMatches = (props: { visible: boolean }) => {
  const { part, product, selectedMotors } = useContext(M3S2Context);
  const [items, setItems] = useState<ProductInterface[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);
  const [viewAll, setViewAll] = useState(false);
  const { productStore } = useStore();

  const getProducts = async () => {
    setLoading(true);
    const resp = await productStore.fetchProductByProps(
      product.brand,
      part,
      selectedMotors,
      product.miscInfo
    );
    setLoading(false);
    if (resp.ok) setItems(resp?.data ?? []);

    // setItems(
    //   resp.data?.map((s) => ({
    //     id: parseInt(s.id ?? "-1"),
    //     name: s.generic,
    //     price: s.sell_price,
    //     remarks: "",
    //   })) ?? []
  };

  useEffect(() => {
    const getData = setTimeout(() => {
      getProducts();
    }, 100);

    return () => clearTimeout(getData);
  }, [part, product, selectedMotors]);

  return (
    <View
      style={{
        flex: 2,
        display: props.visible ? "flex" : "none",
        backgroundColor: "lightblue",
      }}
    >
      {loading ? (
        <LoadingView />
      ) : (
        <>
          <PagerView
            style={styles.viewPager}
            initialPage={0}
            scrollEnabled={true}
            onPageSelected={(e) => setActive(e.nativeEvent.position)}
          >
            {items.map((s) => (
              <View style={styles.page} key={`${s.id}`}>
                <Pressable onPress={() => setViewAll((prev) => !prev)}>
                  <Text>{s.generic}</Text>
                  <View style={{ display: viewAll ? "flex" : "none" }}>
                    <Text>{s.motors}</Text>
                  </View>
                </Pressable>
              </View>
            ))}
          </PagerView>
          <Dots length={items.length} active={active} passiveColor="white" />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  matches: {
    flex: 1,
    margin: 10,
    height: 30,
    borderRadius: 25,
    borderColor: "gray",
    backgroundColor: "lightcyan",
    justifyContent: "center",
    alignItems: "center",
  },
  viewPager: {
    flex: 1,
  },
  page: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "lightcyan",
    padding: 5,
    margin: 10,
  },
});
