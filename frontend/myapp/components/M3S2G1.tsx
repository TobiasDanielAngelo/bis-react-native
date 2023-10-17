import { useContext, useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Dots from "react-native-dots-pagination";
import PagerView from "react-native-pager-view";
import {
  InventoryContext,
  M3S2Context,
  ProductInterface,
} from "../constants/interfaces";
import { useStore } from "../stores/Store";
import { LoadingView } from "./G2C1";

export const ProductListMatches = (props: {}) => {
  const { part, product, selectedMotors, mode, setMode, setItem } =
    useContext(InventoryContext);
  const [items, setItems] = useState<ProductInterface[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);
  const [viewAll, setViewAll] = useState(false);
  const { sparePartStore, productStore } = useStore();

  const toProductShortName = (t: ProductInterface) => {
    return `${sparePartStore.sparePartName(parseInt(t.part))}${
      t.description !== "" ? " " + t.description : ""
    }${
      t.motors !== ""
        ? sparePartStore.spareParts.find((s) => s.id === parseInt(t.part))
            ?.is_motor_shown
          ? " " + t.motors.split(", ")[0].replaceAll("_", " ")
          : ""
        : ""
    }${t.brand !== "" ? " " + t.brand : ""}${
      t.is_orig
        ? " ORIG."
        : sparePartStore.spareParts.find((s) => s.id === parseInt(t.part))
            ?.is_semi_shown
        ? " SEMI."
        : ""
    }`.toUpperCase();
  };

  const getProducts = async () => {
    if (part !== -1) {
      setLoading(true);
      const resp = await productStore.fetchProductByProps(
        product.brand.toUpperCase(),
        sparePartStore.sparePartName(part),
        selectedMotors,
        product.miscInfo.toUpperCase()
      );
      setLoading(false);
      if (resp.ok) setItems(resp?.data ?? []);
    } else {
      setItems([]);
    }
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
        flex: viewAll ? 5.2 : 2.7,
        margin: 5,
        display: items.length > 0 && mode === "create" ? "flex" : "none",
        // backgroundColor: "lightblue",
      }}
    >
      {loading ? (
        <LoadingView />
      ) : (
        <>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginHorizontal: 10,
            }}
          >
            <Text>Similar Products</Text>
            <Text
              style={{ color: "gray" }}
              onPress={() => setViewAll((prev) => !prev)}
            >
              {!viewAll ? "See More" : "Hide"}
            </Text>
          </View>
          <PagerView
            style={styles.viewPager}
            initialPage={0}
            scrollEnabled={true}
            onPageSelected={(e) => setActive(e.nativeEvent.position)}
          >
            {items.map((s) => (
              <View
                style={[styles.listItem, styles.shadowProp]}
                key={`${s.id}`}
              >
                <Pressable
                  onPress={() => setViewAll((prev) => !prev)}
                  onLongPress={() => {
                    setItem(s);
                    setMode("update");
                  }}
                >
                  <Text style={styles.mainItemText}>
                    {toProductShortName(s)}
                  </Text>
                  <View style={{ display: viewAll ? "flex" : "none" }}>
                    <Text style={styles.descriptionText}>
                      {s.location !== "" && `Located at Shelf ${s.location}`}
                    </Text>
                    <Text style={styles.descriptionText}>
                      {s.motors !== "" && "For " + s.motors}
                    </Text>
                    <Text style={styles.priceText}>
                      Purchase: {s.purchase_price} @ {s.piece_count} {s.unit}
                    </Text>
                    <Text style={styles.priceText}>
                      Selling: {s.sell_price} @ {s.piece_count} {s.unit}
                    </Text>
                  </View>
                </Pressable>
              </View>
            ))}
          </PagerView>
          <Dots
            length={items.length}
            active={active}
            passiveColor="lightgray"
            activeColor="teal"
          />
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
    backgroundColor: "lightblue",
    justifyContent: "center",
    alignItems: "center",
  },
  viewPager: {
    flex: 1,
  },
  page: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "lightblue",
    padding: 5,
    margin: 10,
  },

  listItem: {
    backgroundColor: "white",
    padding: 10,
    marginTop: 10,
    marginHorizontal: 10,
    marginBottom: 7,
  },
  shadowProp: {
    shadowColor: "black",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 7,
    elevation: 5,
  },
  descriptionText: {
    fontSize: 15,
    textAlign: "left",
    color: "grey",
    fontFamily: "monospace",
  },
  priceText: { fontSize: 15, textAlign: "right", fontFamily: "monospace" },
  mainItemText: { fontSize: 18, textAlign: "left", fontFamily: "monospace" },
});
