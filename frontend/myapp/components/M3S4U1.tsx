import { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Icon } from "react-native-elements";
import { ScrollView, TextInput } from "react-native-gesture-handler";
import {
  defaultProduct,
  defaultProductFullyQuantified,
  defaultProductQuantified,
} from "../constants/constants";
import { priceToCode } from "../constants/helpers";
import {
  InventoryContext,
  M3S4Context,
  MainContext,
  ProductFullyQuantified,
  ProductInterface,
} from "../constants/interfaces";
import { useStore } from "../stores/Store";

export const CountingProductItem = (props: {}) => {
  const { currentUser } = useContext(MainContext);
  const [show, setShow] = useState(false);
  const [editLocation, setEditLocation] = useState(false);
  const [editQty, setEditQty] = useState(false);
  const [currQty, setCurrQty] = useState("0");
  const [location, setLocation] = useState("");

  const { sparePartStore, productStore, particularPOSStore } = useStore();

  const {
    productDetails,
    setProducts,
    setProductDetails,
    loading,
    setLoading,
    setPopup,
    session,
    sessions,
  } = useContext(M3S4Context);

  const { setView, setMode, setItem, setSelectedMotors, setProduct, setPart } =
    useContext(InventoryContext);

  const onUpdateProductLocation = async () => {
    if (
      location === "" ||
      !"abcdefghijklmnopqrstuvwxyz".includes(location.toLocaleLowerCase())
    )
      return;

    await productStore.updateProduct(productDetails.product.id ?? "-1", {
      location: location.toUpperCase(),
    });

    setProducts((prev: ProductFullyQuantified[]) => {
      (
        prev.find((s) => s.product.id === productDetails.product.id) ??
        defaultProductFullyQuantified
      ).product.location = location.toUpperCase();

      return [...prev];
    });

    setProductDetails({
      ...productDetails,
      location: location.toUpperCase(),
    });

    setEditLocation(false);
  };

  const onUpdatePrintCountProduct = async () => {
    const resp = await productStore.updateProduct(
      productDetails.product.id ?? "-1",
      {
        print_count: 0,
      }
    );

    setProducts((prev: ProductFullyQuantified[]) => {
      (
        prev.find((s) => s.product.id === productDetails.product.id) ??
        defaultProductFullyQuantified
      ).product.print_count = resp.data?.print_count ?? 0;

      return [...prev];
    });

    setProductDetails({
      ...productDetails,
      print_count: 0,
    });
  };

  const getQuantity = async () => {
    if (productDetails.product.id === "-1") return;
    console.log("BOOMI");
    setLoading(true);

    const resp = await particularPOSStore.fetchPOSQuantityOfProduct(
      parseInt(productDetails.product.id ?? "-1")
    );

    setProducts((prev: ProductFullyQuantified[]) => {
      (
        prev.find((s) => s.product.id === productDetails.product.id) ??
        defaultProductFullyQuantified
      ).quantity = resp.data?.quantity ?? 0;
      (
        prev.find((s) => s.product.id === productDetails.product.id) ??
        defaultProductFullyQuantified
      ).gained = resp.data?.gained ?? 0;
      (
        prev.find((s) => s.product.id === productDetails.product.id) ??
        defaultProductFullyQuantified
      ).lost = resp.data?.lost ?? 0;
      (
        prev.find((s) => s.product.id === productDetails.product.id) ??
        defaultProductFullyQuantified
      ).purchased = resp.data?.purchased ?? 0;
      (
        prev.find((s) => s.product.id === productDetails.product.id) ??
        defaultProductFullyQuantified
      ).sold = resp.data?.sold ?? 0;
      (
        prev.find((s) => s.product.id === productDetails.product.id) ??
        defaultProductFullyQuantified
      ).returned = resp.data?.returned ?? 0;
      return [...prev];
    });

    setProductDetails({
      ...productDetails,
      quantity: resp.data?.quantity ?? 0,
      gained: resp.data?.gained ?? 0,
      lost: resp.data?.lost ?? 0,
      purchased: resp.data?.purchased ?? 0,
      sold: resp.data?.sold ?? 0,
      returned: resp.data?.returned ?? 0,
    });

    setCurrQty((resp.data?.quantity ?? 0).toString());
    setLoading(false);
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

  const onDuplicateProduct = () => {
    setSelectedMotors([]);
    setProduct(defaultProduct);
    setPart(-1);
    setMode("create");
    setView("products");
    setItem(productDetails.product);
  };

  const onEditProduct = () => {
    setSelectedMotors([]);
    setProduct(defaultProduct);
    setPart(-1);
    setMode("update");
    setView("products");
    setItem(productDetails.product);
  };

  const onCreateSessionItem = async () => {
    if (productDetails.quantity > parseInt(currQty)) {
      setEditQty(false);
    }

    await particularPOSStore.addParticularPOS(
      {
        remarks: "",
        description: `${
          productDetails.quantity < parseInt(currQty) ? "ADU" : "SBU"
        }${productDetails.product.id}***${toProductShortName(
          productDetails.product
        )}`,
        quantity: Math.abs(productDetails.quantity - parseInt(currQty)),
        unit_amount: 0,
      },
      parseInt(session.id)
    );

    setProductDetails((prev: ProductFullyQuantified) => ({
      ...productDetails,
      gained: prev.gained - productDetails.quantity + parseInt(currQty),
    }));

    setProducts((prev: ProductFullyQuantified[]) => {
      if (prev.find((s) => s.product.id === productDetails.product.id))
        (
          prev.find((s) => s.product.id === productDetails.product.id) ??
          defaultProductFullyQuantified
        ).gained =
          (
            prev.find((s) => s.product.id === productDetails.product.id) ??
            defaultProductFullyQuantified
          ).gained -
          productDetails.quantity +
          parseInt(currQty);

      return [...prev];
    });

    setEditQty(false);
  };

  useEffect(() => {
    setLoading(false);
    if (productDetails.product.id === "-1") return;
    getQuantity();
    setLocation(productDetails.product.location);
  }, [productDetails.product.id]);

  return (
    <>
      <View
        style={[
          styles.listItem,
          styles.shadowProp,
          {
            justifyContent: "center",
            display:
              loading && productDetails.product.id !== "-1" ? "flex" : "none",
          },
        ]}
      >
        <ActivityIndicator size="large" />
      </View>
      <View
        style={[
          styles.listItem,
          styles.shadowProp,
          {
            justifyContent: "space-between",
            display:
              !loading && productDetails.product.id !== "-1" ? "flex" : "none",
          },
        ]}
      >
        <Text style={styles.mainItemText}>
          {toProductShortName(productDetails.product)}
        </Text>
        <Text
          onPress={() => setShow((prev) => !prev)}
          style={{
            display:
              productDetails.product.motors.split(", ").length > 10
                ? "flex"
                : "none",
            textAlign: "right",
            color: "gray",
          }}
        >
          {!show ? "Show More" : "Show Less"}
        </Text>
        <ScrollView>
          <View
            style={{
              marginVertical: 1,
              marginHorizontal: 2,
              padding: 5,
              flexDirection: "row",
              justifyContent: "center",
              backgroundColor: "lightblue",
              display:
                productDetails.product.motors.split(", ").length > 0 &&
                productDetails.product.motors !== ""
                  ? "flex"
                  : "none",
              flexWrap: "wrap",
              borderRadius: 20,
            }}
          >
            {(show || productDetails.product.motors.split(", ").length <= 10
              ? productDetails.product.motors.split(", ")
              : [
                  ...productDetails.product.motors.split(", ").slice(0, 10),
                  "...",
                ]
            ).map((s) => (
              <View
                style={{
                  backgroundColor: "lightcyan",
                  borderRadius: 20,
                  padding: 5,
                  margin: 3,
                }}
                key={`selectedmotor-${s}`}
              >
                <Text style={{ fontSize: 14 }}>{s.replaceAll("_", " ")}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
        <View style={{ marginVertical: 10 }}>
          <Text
            style={[
              styles.priceText,
              { display: currentUser.privilege !== "3" ? "flex" : "none" },
            ]}
          >
            {`Purchase Price : ${
              productDetails.product.purchase_price
            } (${priceToCode(productDetails.product.purchase_price)})`}
          </Text>
          <Text style={styles.priceText}>
            {`Selling  Price : ${productDetails.product.sell_price}`}
          </Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <View>
            <Text style={{ color: "gray" }}>Location:</Text>
            <View style={{ flexDirection: "row" }}>
              <TextInput
                onChangeText={setLocation}
                value={location}
                style={{
                  fontSize: 20,
                  textAlign: "center",
                  borderWidth: editLocation ? 1 : 0,
                  borderColor: "grey",
                  width: 50,
                  height: 30,
                  marginRight: 5,
                  color: "black",
                }}
                editable={editLocation}
                maxLength={1}
              />
              <Icon
                name={editLocation ? "check" : "edit"}
                color={"gray"}
                onPress={() =>
                  editLocation
                    ? onUpdateProductLocation()
                    : setEditLocation(true)
                }
              />
            </View>
          </View>
          <View>
            <Text style={{ color: "gray" }}>Count:</Text>
            <View style={{ flexDirection: "row" }}>
              <TextInput
                onChangeText={setCurrQty}
                value={currQty}
                style={{
                  fontSize: 25,
                  textAlign: "center",
                  borderWidth: editQty ? 1 : 0,
                  borderColor: "grey",
                  fontWeight: "bold",
                  color: "black",
                  width: 80,
                  height: 30,
                }}
                keyboardType="numeric"
                editable={editQty}
              />
              <Text
                style={{
                  fontSize: 18,
                  textAlign: "center",
                  marginHorizontal: 10,
                }}
              >
                x {productDetails.product.piece_count}{" "}
                {productDetails.product.unit}
              </Text>
            </View>
          </View>
        </View>
        <View style={{ marginTop: 10 }}>
          <Text
            style={{
              color:
                productDetails.quantity > parseInt(currQty)
                  ? "darkred"
                  : "green",
              fontSize: 15,
            }}
          >
            {currQty &&
            productDetails.gained +
              productDetails.purchased +
              productDetails.returned -
              productDetails.sold -
              productDetails.lost !==
              parseInt(currQty)
              ? `This will ${
                  productDetails.quantity > parseInt(currQty)
                    ? "subtract"
                    : "add"
                } ${Math.abs(
                  productDetails.quantity - parseInt(currQty)
                )} items to your inventory.`
              : ""}
          </Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            display: currentUser.privilege !== "3" ? "flex" : "none",
          }}
        >
          <View style={{ alignItems: "center" }}>
            <Text
              style={{
                color: "gray",
                fontSize: 15,
              }}
            >
              Sold
            </Text>
            <Text>{productDetails.sold}</Text>
          </View>
          <View style={{ alignItems: "center" }}>
            <Text
              style={{
                color: "gray",
                fontSize: 15,
              }}
            >
              Returned
            </Text>
            <Text>{productDetails.returned}</Text>
          </View>
          <View style={{ alignItems: "center" }}>
            <Text
              style={{
                color: "gray",
                fontSize: 15,
              }}
            >
              Purchased
            </Text>
            <Text>{productDetails.purchased}</Text>
          </View>
          <View style={{ alignItems: "center" }}>
            <Text
              style={{
                color: "gray",
                fontSize: 15,
              }}
            >
              Gained/Lost
            </Text>
            <Text
              style={{
                color:
                  productDetails.gained >= productDetails.lost
                    ? "green"
                    : "darkred",
              }}
            >
              {productDetails.gained - productDetails.lost}
            </Text>
          </View>
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 20,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              flex: 5,
              justifyContent: "space-between",
              display: !editQty && !editLocation ? "flex" : "none",
            }}
          >
            <Pressable onPress={onDuplicateProduct}>
              <Icon name={"file-copy"} color={"gray"} size={30} />
              <Text style={{ color: "gray" }}>Duplicate</Text>
            </Pressable>
            <Pressable onPress={onEditProduct}>
              <Icon name={"edit"} color={"gray"} size={30} />
              <Text style={{ color: "gray" }}>Edit this</Text>
            </Pressable>

            <Pressable
              onPress={() =>
                productDetails.product.print_count > 0
                  ? onUpdatePrintCountProduct()
                  : setPopup("print")
              }
            >
              <Icon
                name={"print"}
                color={
                  productDetails.product.print_count > 0
                    ? "darkgoldenrod"
                    : "gray"
                }
                size={30}
              />
              <Text
                style={{
                  color:
                    productDetails.product.print_count > 0
                      ? "darkgoldenrod"
                      : "gray",
                }}
              >
                {productDetails.product.print_count > 0
                  ? `Queued (${productDetails.product.print_count})`
                  : `Print Label`}
              </Text>
            </Pressable>
          </View>
          <View
            style={{
              flexDirection: "row",
              flex: 3,
              justifyContent: "space-between",
            }}
          >
            <Pressable onPress={() => setEditQty(false)}>
              <Icon
                name={"cancel"}
                color={"darkred"}
                size={30}
                style={{
                  display: editQty ? "flex" : "none",
                }}
              />
              <Text
                style={{ color: "darkred", display: editQty ? "flex" : "none" }}
              >
                Cancel
              </Text>
            </Pressable>

            <Pressable
              onPress={() =>
                editQty ? onCreateSessionItem() : setEditQty(true)
              }
              style={{
                display: session.isOngoing ? "flex" : "none",
              }}
            >
              <Icon
                name={editQty ? "assignment-turned-in" : "format-list-bulleted"}
                color={editQty ? "green" : "gray"}
                size={30}
              />
              <Text
                style={{
                  color: editQty ? "green" : "gray",
                }}
              >
                {editQty ? "Done!" : "Itemize"}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  listItem: {
    backgroundColor: "white",
    padding: 10,
    margin: 5,
    flex: 1,
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
