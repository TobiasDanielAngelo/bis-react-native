import { useContext, useEffect, useState } from "react";
import { StyleSheet, View, Text } from "react-native";
import Dots from "react-native-dots-pagination";
import { Icon } from "react-native-elements";
import { defaultProductQuantified } from "../constants/constants";
import {
  M3S4Context,
  ProductInterface,
  ProductQuantified,
} from "../constants/interfaces";
import { CountingProductItem } from "./M3S4U1";
import DropDownPicker from "react-native-dropdown-picker";
import { useStore } from "../stores/Store";

export const ProductsPlaced = () => {
  const { products, productDetails, setProductDetails } =
    useContext(M3S4Context);
  const { sparePartStore } = useStore();

  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);

  const onChangeProduct = (t: any) => {
    setProductDetails(products.find((s) => s.product.id === t()));
  };

  const toProductShortName = (t: ProductInterface) => {
    return `${sparePartStore.sparePartName(parseInt(t.part))}${
      t.description !== "" ? " " + t.description : ""
    }${
      t.motors !== "" &&
      sparePartStore.spareParts.find((s) => s.id === parseInt(t.part))
        ?.is_motor_shown
        ? " " + t.motors.split(", ")[0].replaceAll("_", " ")
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

  useEffect(() => {
    setIndex(
      products.map((s) => s.product.id).indexOf(productDetails.product.id)
    );
  }, [productDetails.product.id]);

  return (
    <View style={{ flex: 1, marginBottom: 10, zIndex: -1 }}>
      <View
        style={{
          margin: 10,
          flexDirection: "row",
          justifyContent: "center",
        }}
      >
        <Icon
          name="navigate-before"
          onPress={
            index > 0
              ? () => {
                  setProductDetails(
                    products.find((s, ind) => ind === index - 1) ??
                      defaultProductQuantified
                  );
                  setIndex((prev) => prev - 1);
                }
              : () => {}
          }
        />
        <View>
          <Dots
            length={products.length}
            active={index}
            passiveColor="lightgray"
            activeColor="teal"
          />
        </View>
        <Icon
          name="navigate-next"
          onPress={
            index < products.length - 1
              ? () => {
                  setProductDetails(
                    products.find((s, ind) => ind === index + 1) ??
                      defaultProductQuantified
                  );
                  setIndex((prev) => prev + 1);
                }
              : () => {}
          }
        />
      </View>
      <View style={{ marginHorizontal: 10 }}>
        <DropDownPicker
          items={products.map((s) => ({
            label: toProductShortName(s.product),
            value: s.product.id,
            icon: () => <></>,
          }))}
          multiple={false}
          setValue={onChangeProduct}
          value={productDetails.product.id ?? "-1"}
          open={open}
          setOpen={setOpen}
          textStyle={{
            fontSize: 15,
            fontFamily: "monospace",
          }}
          style={{
            height: 50,
            borderColor: "#ddd",
            borderRadius: 0,
            minHeight: 35,
          }}
          listMode="MODAL"
          placeholder={`See products in this location.`}
          placeholderStyle={{ color: "gray" }}
          searchable={true}
          searchPlaceholder="Search..."
        />
      </View>
      <CountingProductItem />
    </View>
  );
};

const styles = StyleSheet.create({
  viewPager: {
    flex: 1,
  },
  page: {
    justifyContent: "flex-start",
    alignItems: "center",
  },
});
