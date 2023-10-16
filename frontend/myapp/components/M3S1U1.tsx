import { StyleSheet, Text, View } from "react-native";
import { useCallback, useEffect, useState, useContext } from "react";
import {
  M3S1Context,
  OrderItem,
  ProductInterface,
} from "../constants/interfaces";
import { useStore } from "../stores/Store";
import { defaultProductInterface } from "../constants/constants";
import { Icon } from "react-native-elements";
import { TextInput } from "react-native-gesture-handler";

export const PotentialProductItem = (props: {
  order: OrderItem;
  selected: boolean;
}) => {
  const {
    sparePartStore,
    productStore,
    particularPOSStore,
    particularPurchaseStore,
  } = useStore();
  const [product, setProduct] = useState<ProductInterface>(
    defaultProductInterface
  );
  const { setOrderItems } = useContext(M3S1Context);
  const [currQty, setCurrQty] = useState(0);

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
      t.is_orig ? " ORIG." : ""
    }`.toUpperCase();
  };

  const getProductDetails = async () => {
    const resp = (await productStore.fetchProduct(props.order.productId)).data;

    setProduct(resp ?? defaultProductInterface);
  };

  const getQuantity = async () => {
    const resp = await particularPOSStore.fetchPOSQuantityOfProduct(
      props.order.productId
    );
    setCurrQty(resp.data?.quantity ?? 0);
  };

  const onDeleteOrderItem = async () => {
    await particularPurchaseStore.deleteParticularPurchase(
      (props.order.id ?? -1).toString()
    );

    setOrderItems((prev: OrderItem[]) => {
      prev.splice(
        prev.findIndex((s) => s.id === props.order.id),
        1
      );
      return [...prev];
    });
  };

  const onUpdateQty = async (qty: string) => {
    setOrderItems((prev: OrderItem[]) => {
      let targetOrderItem = prev.find((s) => s.id === props.order.id);
      if (targetOrderItem)
        targetOrderItem.qty = !isNaN(parseInt(qty)) ? parseInt(qty) : 0;
      return [...prev];
    });
    if (parseInt(qty) !== 0 && !isNaN(parseInt(qty)))
      await particularPurchaseStore.updateParticularPurchase(
        (props.order.id ?? -1).toString(),
        {
          quantity: parseInt(qty),
        }
      );
  };

  useEffect(() => {
    getProductDetails();
    getQuantity();
  }, []);

  return (
    <View
      style={[
        styles.listItem,
        styles.shadowProp,
        {
          height: props.selected ? 250 : 180,
          justifyContent: "space-between",
        },
      ]}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <Text style={styles.mainItemText}>{`${toProductShortName(
          product
        )}`}</Text>
      </View>
      <View>
        <Text style={styles.descriptionText}>
          In Stock : {currQty} x {product.piece_count} {product.unit}
        </Text>
        <Text style={styles.descriptionText}>
          Required : {product.min_quantity} x {product.piece_count}{" "}
          {product.unit}
        </Text>
      </View>
      <View style={{ display: props.selected ? "flex" : "none" }}>
        <Text style={styles.descriptionText}>
          {product.motors === ""
            ? ""
            : `For motors ${product.motors
                .replaceAll("_", " ")
                .substring(0, 35)}${product.motors.length > 35 ? "..." : ""}`}
        </Text>
        <Text style={styles.descriptionText}>
          {`Purchasing @ ${product.purchase_price} / ${product.piece_count} ${product.unit}`}
        </Text>
        <Text style={styles.descriptionText}>
          {`Selling @ ${product.sell_price} / ${product.piece_count} ${product.unit}`}
        </Text>
        <Text style={styles.descriptionText}>
          {`Located @ Shelf ${product.location}`}
        </Text>
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-end",
        }}
      >
        <Icon name="close" color="gray" onPress={onDeleteOrderItem} />
        <View>
          <Text style={{ color: "gray" }}>To Order:</Text>
          <View style={{ flexDirection: "row" }}>
            <TextInput
              onChangeText={onUpdateQty}
              value={`${props.order.qty}`}
              style={{
                fontSize: 20,
                textAlign: "center",
                borderWidth: 1,
                borderColor: "grey",
                width: 80,
                height: 30,
              }}
              keyboardType="numeric"
            />
            <Text
              style={{
                fontSize: 18,
                textAlign: "center",
                marginHorizontal: 10,
              }}
            >
              x {product.piece_count} {product.unit}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  listItem: {
    backgroundColor: "white",
    padding: 10,
    margin: 5,
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
  priceText: { fontSize: 19, textAlign: "right", fontFamily: "monospace" },
  mainItemText: { fontSize: 18, textAlign: "left", fontFamily: "monospace" },
});
