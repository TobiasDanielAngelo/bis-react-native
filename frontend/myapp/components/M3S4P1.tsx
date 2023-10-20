import { useContext, useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { Icon, Overlay } from "react-native-elements";
import { M3S4Context, ProductFullyQuantified } from "../constants/interfaces";
import { useStore } from "../stores/Store";
import { defaultProductFullyQuantified } from "../constants/constants";

export const LabelPrintModal = (props: {}) => {
  const { setProductDetails, setProducts, productDetails, popup, setPopup } =
    useContext(M3S4Context);
  const [printCount, setPrintCount] = useState("0");
  const { productStore } = useStore();

  useEffect(() => {
    setPrintCount(productDetails.product.print_count.toString());
  }, [productDetails]);

  const onUpdatePrintCountProduct = async () => {
    setProducts((prev: ProductFullyQuantified[]) => {
      (
        prev.find((s) => s.product.id === productDetails.product.id) ??
        defaultProductFullyQuantified
      ).product.print_count = parseInt(printCount);

      return [...prev];
    });

    setProductDetails({
      ...productDetails,
      print_count: parseInt(printCount),
    });

    setPopup("");

    await productStore.updateProduct(productDetails.product.id ?? "-1", {
      print_count: parseInt(printCount),
    });
  };

  return (
    <>
      <Overlay
        isVisible={popup === "print"}
        onBackdropPress={() => setPopup("")}
      >
        <View style={styles.msgBox}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Text style={{ fontSize: 16 }}>Set Label Count to Print</Text>
            <Icon
              name={"close"}
              size={30}
              color={"gainsboro"}
              onPress={() => setPopup("")}
            />
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingRight: 20,
            }}
          >
            <Text style={{ fontSize: 20, color: "grey" }}>Count</Text>
            <TextInput
              style={{
                marginTop: -5,
                padding: 5,
                borderWidth: 1,
                width: 150,
                borderColor: "gainsboro",
                fontSize: 20,
                height: 40,
                textAlign: "center",
              }}
              value={printCount}
              keyboardType="numeric"
              onChangeText={(amt) =>
                setPrintCount(
                  (isNaN(parseFloat(amt.replace(/[^0-9]/g, "")))
                    ? ""
                    : amt.replace(/[^0-9]/g, "")
                  ).toString()
                )
              }
            />
          </View>

          <View style={{ flexDirection: "row-reverse" }}>
            <Icon
              name={"check"}
              size={40}
              color={"gainsboro"}
              onPress={onUpdatePrintCountProduct}
            />
          </View>
        </View>
      </Overlay>
    </>
  );
};

const styles = StyleSheet.create({
  msgBox: {
    height: 200,
    width: 300,
    justifyContent: "space-between",
  },
});
