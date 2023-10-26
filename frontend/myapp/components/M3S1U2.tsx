import { StyleSheet, Text, View } from "react-native";
import { useContext, useEffect, useState } from "react";
import {
  InventoryContext,
  M3S1Context,
  OrderItem,
  ProductInterface,
  ProductQuantified,
} from "../constants/interfaces";
import { useStore } from "../stores/Store";
import { Icon } from "react-native-elements";
import {
  defaultProduct,
  defaultProductInterface,
} from "../constants/constants";

export const OrderProductItem = (props: {
  productQuantified: ProductQuantified;
}) => {
  const {
    motorStore,
    sparePartStore,
    particularPurchaseStore,
    particularPOSStore,
    productStore,
  } = useStore();

  const { setView, setMode, setItem, setSelectedMotors, setProduct, setPart } =
    useContext(InventoryContext);
  const { order, orderItems, setOrderItems, orders, setProducts } =
    useContext(M3S1Context);
  const [otherBrands, setOtherBrands] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  const getQuantity = async () => {
    const resp = await particularPOSStore.fetchPOSQuantityOfProduct(
      parseInt(props.productQuantified.product.id ?? "-1")
    );
    setProducts((prev) => {
      let targetProduct = prev.find(
        (s) => s.product.id === props.productQuantified.product.id
      );
      if (targetProduct) targetProduct.quantity = resp.data?.quantity ?? 0;
      return [...prev];
    });
  };

  const getSimilarItem = async () => {
    const resp = await productStore.fetchProductByProps(
      "",
      sparePartStore.sparePartName(
        parseInt(props.productQuantified.product.part)
      ),
      props.productQuantified.product.motors !== ""
        ? props.productQuantified.product.motors
            .split(", ")
            .map((s) => motorStore.motorId(s) ?? -1)
        : [],
      props.productQuantified.product.description
    );

    setOtherBrands(
      resp.data
        ?.filter(
          (s) =>
            s.id !== props.productQuantified.product.id &&
            s.is_orig === props.productQuantified.product.is_orig
        )
        .map((s) => s.brand) ?? []
    );
  };

  const orderHasProduct = !!orderItems.find(
    (s) =>
      s.orderId === order &&
      s.productId === parseInt(props.productQuantified.product.id ?? "-1")
  );

  const onEditProduct = () => {
    setSelectedMotors([]);
    setProduct(defaultProduct);
    setPart(-1);
    setMode("update");
    setView("products");
    setItem(props.productQuantified.product);
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

  const onCreateOrderItem = async () => {
    const resp = await particularPurchaseStore.addParticularPurchase(
      {
        remarks: "",
        description: `PPU${
          props.productQuantified.product.id
        }***${toProductShortName(props.productQuantified.product)}`,
        quantity: 1,
        unit_amount: 0,
      },
      order
    );

    setOrderItems((prev: OrderItem[]) => [
      ...prev,
      {
        id: parseInt(resp.data?.id ?? "-1"),
        productId: parseInt(props.productQuantified.product.id ?? "-1"),
        orderId: order,
        qty: 1,
        purchasePrice: 0,
        sellPrice: 0,
        brandType: "",
      },
    ]);
  };

  useEffect(() => {
    getQuantity();
    getSimilarItem();
  }, [props.productQuantified.product.id]);

  return (
    <View
      style={[
        styles.listItem,
        styles.shadowProp,
        {
          height: open ? 230 : 130,
          backgroundColor: orderHasProduct ? "#ddd" : "white",
        },
      ]}
    >
      <View
        style={{
          // flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <Text style={styles.mainItemText}>
          {`${toProductShortName(props.productQuantified.product)}`}
        </Text>
        <View
          style={{
            display:
              otherBrands.filter((s) => s !== "").length > 0 ? "flex" : "none",
          }}
        >
          <Text style={styles.descriptionText}>
            More brands: {otherBrands.filter((s) => s !== "").join(", ")}
          </Text>
        </View>
      </View>
      <View>
        <Text style={styles.descriptionText}>
          {`In Stock: ${props.productQuantified.quantity} X ${props.productQuantified.product.piece_count}${props.productQuantified.product.unit} | Minimum: ${props.productQuantified.product.min_quantity} X ${props.productQuantified.product.piece_count}${props.productQuantified.product.unit}`}
        </Text>
        <Text
          style={[styles.descriptionText, { display: open ? "flex" : "none" }]}
        >
          {props.productQuantified.product.motors === ""
            ? ""
            : `For motors ${props.productQuantified.product.motors
                .replaceAll("_", " ")
                .substring(0, 35)}${
                props.productQuantified.product.motors.length > 35 ? "..." : ""
              }`}
        </Text>
      </View>
      <View style={{ display: open ? "flex" : "none" }}>
        <Text style={styles.descriptionText}>
          {`Purchasing @ ${props.productQuantified.product.purchase_price} / ${props.productQuantified.product.piece_count} ${props.productQuantified.product.unit}`}
        </Text>
        <Text style={styles.descriptionText}>
          {`Selling @ ${props.productQuantified.product.sell_price} / ${props.productQuantified.product.piece_count} ${props.productQuantified.product.unit}`}
        </Text>
        <Text style={styles.descriptionText}>
          {`Located @ Shelf ${props.productQuantified.product.location}`}
        </Text>
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Icon
          name="edit"
          color={open ? "gray" : orderHasProduct ? "#ddd" : "white"}
          onPress={onEditProduct}
          disabled={!open}
          disabledStyle={{
            backgroundColor: orderHasProduct ? "#ddd" : "white",
          }}
        />

        <Icon
          name={open ? "expand-less" : "expand-more"}
          color="gray"
          onPress={() => setOpen((prev) => !prev)}
        />
        <Icon
          name="move-to-inbox"
          color={
            orderHasProduct
              ? "#ddd"
              : orders.find((s) => s.id === order)?.status === "editing"
              ? "gray"
              : "white"
          }
          onPress={onCreateOrderItem}
          disabled={
            orderHasProduct ||
            orders.find((s) => s.id === order)?.status !== "editing"
          }
          disabledStyle={{
            backgroundColor: orderHasProduct ? "#ddd" : "white",
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  listItem: {
    backgroundColor: "white",
    padding: 10,
    margin: 5,
    marginHorizontal: 15,
    justifyContent: "space-between",
  },
  shadowProp: {
    shadowColor: "black",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 7,
    elevation: 5,
  },
  descriptionText: {
    fontSize: 12,
    textAlign: "left",
    color: "grey",
    fontFamily: "monospace",
  },
  mainItemText: { fontSize: 16, textAlign: "left", fontFamily: "monospace" },
});
