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
    motorStore,
  } = useStore();
  const [product, setProduct] = useState<ProductInterface>(
    defaultProductInterface
  );
  const { setOrderItems, orderItems, orders } = useContext(M3S1Context);
  const [otherBrands, setOtherBrands] = useState<
    { prodId: number; brandName: string }[]
  >([]);
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
    }${
      t.brand !== "" && props.order.brandType === ""
        ? " " + t.brand
        : props.order.brandType === "any"
        ? " " + otherBrands.map((s) => s.brandName).join("/")
        : ""
    }${
      t.is_orig
        ? " ORIG."
        : sparePartStore.spareParts.find((s) => s.id === parseInt(t.part))
            ?.is_semi_shown
        ? " SEMI."
        : ""
    }`.toUpperCase();
  };

  const getProductDetails = async () => {
    const resp = (await productStore.fetchProduct(props.order.productId)).data;

    setProduct(resp ?? defaultProductInterface);
  };

  const getMotors = async () => {
    await motorStore.fetchMotors();
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

  const getSimilarItem = async () => {
    const resp = await productStore.fetchProductByProps(
      "",
      sparePartStore.sparePartName(parseInt(product.part)),
      product.motors !== ""
        ? product.motors.split(", ").map((s) => motorStore.motorId(s) ?? -1)
        : [],
      product.description
    );

    setOtherBrands(
      resp.data
        ?.filter((s) => s.is_orig === product.is_orig)
        .map((s) => ({
          prodId: parseInt(s.id ?? "-1"),
          brandName: s.brand,
        })) ?? []
    );
  };

  const getEstimatedPrice = async () => {
    const resp = await productStore.fetchProduct(props.order.productId);

    setOrderItems((prev: OrderItem[]) => {
      let targetOrderItem = prev.find((s) => s.id === props.order.id);
      if (targetOrderItem)
        targetOrderItem.purchasePrice = resp.data?.purchase_price ?? 0;
      return [...prev];
    });
  };

  const onChangeProduct = async (prodId: number) => {
    await particularPurchaseStore.updateParticularPurchase(
      (props.order.id ?? -1).toString(),
      {
        remarks:
          prodId > 0 ? "" : prodId === 0 ? "None" : prodId === -2 ? "Any" : "",
      }
    );

    if (prodId > 0)
      await particularPurchaseStore.updateParticularPurchase(
        (props.order.id ?? -1).toString(),
        {
          remarks:
            prodId > 0
              ? ""
              : prodId === 0
              ? "None"
              : prodId === -2
              ? "Any"
              : "",
        }
      );

    setOrderItems((prev: OrderItem[]) => {
      let targetOrderItem = prev.find((s) => s.id === props.order.id);
      if (targetOrderItem) {
        if (prodId > 0) {
          targetOrderItem.productId = prodId;
          targetOrderItem.brandType = "";
        } else targetOrderItem.brandType = prodId === 0 ? "none" : "any";
      }
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
    console.log("BOOM");

    getMotors();
    getProductDetails();
    getQuantity();
    getEstimatedPrice();
  }, [props.order.productId]);

  useEffect(() => {
    getSimilarItem();
  }, [product]);

  return (
    <View
      style={[
        styles.listItem,
        styles.shadowProp,
        {
          height: props.selected ? 250 : 220,
          justifyContent: "space-between",
          backgroundColor:
            orders.find((s) => s.id === props.order.orderId)?.status ===
            "editing"
              ? "white"
              : "#ddd",
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
          P/P : {props.order.purchasePrice}
        </Text>
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
        <Icon
          name="close"
          color={
            orders.find((s) => s.id === props.order.orderId)?.status !==
            "editing"
              ? "#ddd"
              : "gray"
          }
          onPress={onDeleteOrderItem}
          disabled={
            orders.find((s) => s.id === props.order.orderId)?.status !==
            "editing"
          }
          disabledStyle={{ backgroundColor: "#ddd" }}
        />

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
              editable={
                orders.find((s) => s.id === props.order.orderId)?.status ===
                "editing"
              }
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
      <View
        style={{
          display:
            otherBrands
              .filter((s) => s.prodId === parseInt(product.id ?? "-1"))
              .filter((s) => s.brandName !== "").length > 0
              ? "flex"
              : "none",
          flexDirection: "row",
          flexWrap: "wrap",
          // justifyContent: "space-between",
        }}
      >
        <View>
          <Text style={styles.descriptionText}>Other brands:</Text>
        </View>
        {otherBrands
          .filter(
            (s) =>
              s.prodId !== parseInt(product.id ?? "-1") ||
              props.order.brandType !== ""
          )
          .map((s) => (
            <View
              style={{ marginHorizontal: 5 }}
              key={`${props.order.id}-${s.prodId}`}
            >
              <Text
                style={{ textDecorationLine: "underline", color: "teal" }}
                onPress={() => onChangeProduct(s.prodId)}
                disabled={
                  orders.find((s) => s.id === props.order.orderId)?.status !==
                  "editing"
                }
              >
                {s.brandName}
              </Text>
            </View>
          ))}
        <View
          style={{
            marginHorizontal: 5,
            display: props.order.brandType === "any" ? "none" : "flex",
          }}
        >
          <Text
            style={{ textDecorationLine: "underline", color: "teal" }}
            onPress={() => onChangeProduct(-2)}
            disabled={
              orders.find((s) => s.id === props.order.orderId)?.status !==
              "editing"
            }
          >
            *ANY*
          </Text>
        </View>
        <View
          style={{
            marginHorizontal: 5,
            display: props.order.brandType === "none" ? "none" : "flex",
          }}
        >
          <Text
            style={{ textDecorationLine: "underline", color: "teal" }}
            onPress={() => onChangeProduct(0)}
            disabled={
              orders.find((s) => s.id === props.order.orderId)?.status !==
              "editing"
            }
          >
            *NONE*
          </Text>
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
