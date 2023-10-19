import { useContext, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Icon } from "react-native-elements";
import { TextInput } from "react-native-gesture-handler";
import {
  defaultProduct,
  defaultProductInterface,
} from "../constants/constants";
import {
  InventoryContext,
  M3S3Context,
  OrderItem,
  ProductInterface,
} from "../constants/interfaces";
import { useStore } from "../stores/Store";

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
  const [productDetails, setProductDetails] = useState<ProductInterface>(
    defaultProductInterface
  );
  const { setView, setMode, setItem, setSelectedMotors, setProduct, setPart } =
    useContext(InventoryContext);
  const { setOrderItems, orders, search } = useContext(M3S3Context);
  const [otherBrands, setOtherBrands] = useState<
    { prodId: number; brandName: string }[]
  >([]);
  const [currQty, setCurrQty] = useState(0);
  const [purchasePrice, setPurchasePrice] = useState("0");
  const [sellPrice, setSellPrice] = useState("0");
  const [editMode, setEditMode] = useState(false);
  const [selected, setSelected] = useState(false);

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

    setProductDetails(resp ?? defaultProductInterface);
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
      sparePartStore.sparePartName(parseInt(productDetails.part)),
      productDetails.motors !== ""
        ? productDetails.motors
            .split(", ")
            .map((s) => motorStore.motorId(s) ?? -1)
        : [],
      productDetails.description
    );

    setOtherBrands(
      resp.data
        ?.filter((s) => s.is_orig === productDetails.is_orig)
        .map((s) => ({
          prodId: parseInt(s.id ?? "-1"),
          brandName: s.brand,
        })) ?? []
    );
  };

  const onDuplicateProduct = () => {
    setSelectedMotors([]);
    setProduct(defaultProduct);
    setPart(-1);
    setMode("create");
    setView("products");
    setItem(productDetails);
  };

  const getEstimatedPrice = async () => {
    const resp = await productStore.fetchProduct(props.order.productId);

    setOrderItems((prev: OrderItem[]) => {
      let targetOrderItem = prev.find((s) => s.id === props.order.id);
      if (targetOrderItem) {
        targetOrderItem.purchasePrice = resp.data?.purchase_price ?? 0;
        targetOrderItem.sellPrice = resp.data?.sell_price ?? 0;
      }
      return [...prev];
    });

    setPurchasePrice((resp.data?.purchase_price ?? 0).toString());
    setSellPrice((resp.data?.sell_price ?? 0).toString());
  };

  const onUpdateProductPrices = async () => {
    if (isNaN(parseFloat(purchasePrice)) || isNaN(parseFloat(sellPrice))) {
      setEditMode(false);
      return;
    }
    if (parseFloat(purchasePrice) < parseFloat(sellPrice)) {
      await productStore.updateProduct(props.order.productId.toString(), {
        purchase_price: parseFloat(purchasePrice),
        sell_price: parseFloat(sellPrice),
      });

      setOrderItems((prev: OrderItem[]) => {
        let targetOrderItem = prev.find((s) => s.id === props.order.id);
        if (targetOrderItem) {
          targetOrderItem.purchasePrice = parseFloat(purchasePrice);
          targetOrderItem.sellPrice = parseFloat(sellPrice);
        }
        return [...prev];
      });

      setPurchasePrice((prev) => parseFloat(prev).toFixed(2));
      setSellPrice((prev) => parseFloat(prev).toFixed(2));

      setEditMode(false);
    }
  };

  const onUpdateProduct = () => {
    setSelectedMotors([]);
    setProduct(defaultProduct);
    setPart(-1);
    setMode("update");
    setView("products");
    setItem(productDetails);
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
    getMotors();
    getProductDetails();
    getQuantity();
    getEstimatedPrice();
  }, [props.order.productId]);

  useEffect(() => {
    getSimilarItem();
  }, [productDetails]);

  return (
    <View
      style={[
        styles.listItem,
        styles.shadowProp,
        {
          height: selected ? 250 : 200,
          justifyContent: "space-between",
          backgroundColor:
            orders.find((s) => s.id === props.order.orderId)?.status ===
            "delivered"
              ? "white"
              : "#ddd",
          display: search ? "none" : "flex",
        },
      ]}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.mainItemText}>{`${toProductShortName(
            productDetails
          )}`}</Text>
        </View>
        <Icon
          name="delete"
          color={
            orders.find((s) => s.id === props.order.orderId)?.status !==
            "delivered"
              ? "#ddd"
              : "gray"
          }
          onPress={onDeleteOrderItem}
          disabled={
            orders.find((s) => s.id === props.order.orderId)?.status !==
            "delivered"
          }
          disabledStyle={{ backgroundColor: "#ddd" }}
        />
      </View>
      <View>
        <View>
          <View style={{ flexDirection: "row" }}>
            <Text style={styles.priceText}>P/P : </Text>
            <TextInput
              style={[
                styles.priceText,
                {
                  color: editMode
                    ? parseFloat(purchasePrice) > parseFloat(sellPrice)
                      ? "red"
                      : "black"
                    : "gray",
                  top: -3,
                  borderWidth: editMode ? 1 : 0,
                  width: 90,
                  borderColor: "gainsboro",
                  height: 30,
                  textAlign: "right",
                  paddingRight: 3,
                },
              ]}
              value={purchasePrice}
              onChangeText={(amt) =>
                setPurchasePrice(
                  (isNaN(parseFloat(amt.replace(/[^.0-9]/g, "")))
                    ? ""
                    : amt.replace(/[^.0-9]/g, "")
                  ).toString()
                )
              }
              editable={editMode}
            />
          </View>
          <View style={{ flexDirection: "row" }}>
            <Text style={styles.priceText}>S/P : </Text>
            <TextInput
              style={[
                styles.priceText,
                {
                  color: editMode
                    ? parseFloat(purchasePrice) > parseFloat(sellPrice)
                      ? "red"
                      : "black"
                    : "gray",
                  top: -3,
                  borderWidth: editMode ? 1 : 0,
                  width: 90,
                  borderColor: "gainsboro",
                  height: 30,
                  textAlign: "right",
                  paddingRight: 3,
                },
              ]}
              value={sellPrice}
              onChangeText={(amt) =>
                setSellPrice(
                  (isNaN(parseFloat(amt.replace(/[^.0-9]/g, "")))
                    ? ""
                    : amt.replace(/[^.0-9]/g, "")
                  ).toString()
                )
              }
              editable={editMode}
            />
          </View>
        </View>
      </View>
      <View style={{ display: selected ? "flex" : "none" }}>
        <Text style={styles.descriptionText}>
          {productDetails.motors === ""
            ? ""
            : `For motors ${productDetails.motors
                .replaceAll("_", " ")
                .substring(0, 35)}${
                productDetails.motors.length > 35 ? "..." : ""
              }`}
        </Text>
        <Text style={styles.descriptionText}>
          {`Located @ Shelf ${productDetails.location}`}
        </Text>
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-end",
        }}
      >
        {!editMode ? (
          <>
            <Icon
              name={"payments"}
              color={
                orders.find((s) => s.id === props.order.orderId)?.status !==
                "delivered"
                  ? "#ddd"
                  : "gray"
              }
              onPress={() => setEditMode(true)}
              disabled={
                orders.find((s) => s.id === props.order.orderId)?.status !==
                "delivered"
              }
              disabledStyle={{ backgroundColor: "#ddd" }}
            />
            {selected && (
              <>
                <Icon
                  name="file-copy"
                  color="gray"
                  onPress={onDuplicateProduct}
                />
                <Icon name="edit" color="gray" onPress={onUpdateProduct} />
              </>
            )}
          </>
        ) : (
          <>
            <Icon
              name={"undo"}
              color={
                orders.find((s) => s.id === props.order.orderId)?.status !==
                "delivered"
                  ? "#ddd"
                  : "gray"
              }
              onPress={() => setEditMode(false)}
              disabled={
                orders.find((s) => s.id === props.order.orderId)?.status !==
                "delivered"
              }
              disabledStyle={{ backgroundColor: "#ddd" }}
            />
            <Icon
              name={"check"}
              color={
                orders.find((s) => s.id === props.order.orderId)?.status !==
                "delivered"
                  ? "#ddd"
                  : "gray"
              }
              onPress={onUpdateProductPrices}
              disabled={
                orders.find((s) => s.id === props.order.orderId)?.status !==
                "delivered"
              }
              disabledStyle={{ backgroundColor: "#ddd" }}
            />
          </>
        )}

        <Icon
          name={selected ? "expand-less" : "expand-more"}
          color="gray"
          onPress={() => setSelected((prev) => !prev)}
        />

        <View>
          <Text style={{ color: "gray" }}>Count:</Text>
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
                "delivered"
              }
            />
            <Text
              style={{
                fontSize: 18,
                textAlign: "center",
                marginHorizontal: 10,
              }}
            >
              x {productDetails.piece_count} {productDetails.unit}
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
  priceText: {
    fontSize: 16,
    textAlign: "left",
    fontFamily: "monospace",
  },
  mainItemText: { fontSize: 18, textAlign: "left", fontFamily: "monospace" },
});
