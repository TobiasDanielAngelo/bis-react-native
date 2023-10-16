import { useCallback, useContext, useEffect, useState } from "react";
import {
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { Icon } from "react-native-elements";
import {
  defaultProduct,
  defaultProductInterface,
} from "../constants/constants";
import {
  InventoryContext,
  M3S2Context,
  ProductInterface,
  SparePartInterface,
} from "../constants/interfaces";
import { useStore } from "../stores/Store";

export const ProductForm = (props: { item?: ProductInterface }) => {
  const { motorStore, sparePartStore, productStore } = useStore();
  const {
    mode,
    setItem,
    part,
    setPart,
    product,
    setProduct,
    selectedMotors,
    setSelectedMotors,
  } = useContext(InventoryContext);
  const { motors } = useContext(M3S2Context);
  const [parts, setParts] = useState<SparePartInterface[]>([]);

  const [ok, setOk] = useState(true);
  const [msg, setMsg] = useState("");
  const [motorsOpen, setMotorsOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);

  const onCreateProduct = async () => {
    let details = {
      piece_count: parseInt(product.pieces),
      unit: product.unit.toUpperCase(),
      description: product.miscInfo.toUpperCase(),
      brand: product.brand.toUpperCase(),
      part: part.toString(),
      motors: selectedMotors.map((s) => motorStore.motorName(s)).join(", "),
      datetime_added: new Date().toISOString(),
      is_active: true,
      location: product.location.toUpperCase(),
      purchase_price: parseFloat(product.packPP),
      sell_price: parseFloat(product.packSP),
      min_quantity: parseInt(product.minimum),
      is_orig: product.isOrig,
    };

    try {
      const resp = await productStore.addProduct(details);
      if (!resp.ok) {
        setOk(false);
        setMsg("Error adding this product.");
        return;
      }
      setOk(true);
      setMsg(`Added product #${resp.data?.id}.`);

      setCategoryOpen(false);
      setMotorsOpen(false);
      setPart(-1);
      setProduct(defaultProduct);
      setSelectedMotors([]);
    } catch (error) {
      console.log(error);
    }
  };

  const onUpdateProduct = async () => {
    let details = {
      piece_count: parseInt(product.pieces),
      unit: product.unit.toUpperCase(),
      description: product.miscInfo.toUpperCase(),
      brand: product.brand.toUpperCase(),
      part: part.toString(),
      motors: selectedMotors.map((s) => motorStore.motorName(s)).join(", "),
      datetime_added: new Date().toISOString(),
      is_active: true,
      location: product.location.toUpperCase(),
      purchase_price: parseFloat(product.packPP),
      sell_price: parseFloat(product.packSP),
      min_quantity: parseInt(product.minimum),
      is_orig: product.isOrig,
    };

    try {
      const resp = await productStore.updateProduct(
        (props.item?.id ?? -1).toString(),
        details
      );
      if (!resp.ok) {
        setOk(false);
        setMsg("Error updating this product.");
        return;
      }
      setOk(true);
      setMsg(`Updated product #${resp.data?.id}.`);

      setCategoryOpen(false);
      setMotorsOpen(false);
      setPart(-1);
      setProduct(defaultProduct);
      setSelectedMotors([]);
      setItem(defaultProductInterface);
    } catch (error) {
      console.log(error);
    }
  };

  const prioritizeMotor = (t: number) => {
    setSelectedMotors((prev: number[]) => {
      return [t, ...prev.filter((s) => s !== t)];
    });
  };

  const deleteMotor = (t: number) => {
    setSelectedMotors((prev: number[]) => {
      return prev.filter((s) => s !== t);
    });
  };

  const setProductItem = useCallback(async () => {
    let resp;
    if (props.item) {
      resp = (await productStore.fetchProduct(parseInt(props.item.id ?? "-1")))
        .data;
      setProduct({
        brand: resp?.brand ?? "",
        pieces: resp?.piece_count.toString() ?? "1",
        unitPP: resp?.purchase_price.toString() ?? "0",
        packPP:
          ((resp?.piece_count ?? 1) * (resp?.purchase_price ?? 0)).toString() ??
          "0",
        unitSP: resp?.sell_price.toString() ?? "0",
        packSP:
          ((resp?.piece_count ?? 1) * (resp?.sell_price ?? 0)).toString() ??
          "0",
        miscInfo: resp?.description ?? "",
        location: resp?.location ?? "",
        minimum: resp?.min_quantity.toString() ?? "0",
        unit: resp?.unit ?? "pc.",
        isOrig: resp?.is_orig ?? false,
      });
      setPart(resp?.part);
      if (!!resp?.motors)
        setSelectedMotors(
          resp?.motors.split(", ").map((s) => motorStore.motorId(s) ?? -1) ?? []
        );
    }
  }, [props.item]);

  console.log(selectedMotors);

  const getSpareParts = async () => {
    await sparePartStore.fetchSpareParts();
    setParts(sparePartStore.spareParts);
  };

  useEffect(() => {
    getSpareParts();
  }, []);

  useEffect(() => {
    setProductItem();
  }, [props.item]);

  return (
    <View
      style={{
        paddingVertical: 10,
        flex: 8,
      }}
    >
      <Text
        style={{
          textAlign: "right",
          marginHorizontal: 10,
          color: ok ? "darkgreen" : "darkred",
        }}
      >
        {msg}
      </Text>
      <ScrollView
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="always"
        persistentScrollbar={true}
        style={{ marginRight: 10 }}
      >
        <View style={{ marginHorizontal: 20 }}>
          <Text>Item Category</Text>
          <DropDownPicker
            items={[
              ...parts.map((s) => ({
                label: s.name,
                value: s.id,
                icon: () => <Icon name="inventory" size={20} />,
              })),
              // {
              //   label: partQuery.toUpperCase(),
              //   value: 0,
              //   icon: () => <Icon name="add" size={20} color="red" />,
              // },
            ]}
            multiple={false}
            setValue={setPart}
            value={part}
            open={categoryOpen}
            setOpen={setCategoryOpen}
            // onChangeSearchText={setPartQuery}
            textStyle={{
              fontSize: 17,
            }}
            flatListProps={{
              keyboardShouldPersistTaps: "always",
              nestedScrollEnabled: true,
            }}
            listMode="MODAL"
            style={{
              borderColor: "#ddd",
              borderRadius: 0,
              marginBottom: 5,
            }}
            placeholderStyle={{ color: "gray" }}
            placeholder="Select a part"
            searchable={true}
            searchPlaceholder="Search..."
          />
        </View>
        <View style={{ marginHorizontal: 20 }}>
          <Text>Additional Information</Text>
          <TextInput
            style={{
              borderWidth: 1,
              backgroundColor: "white",
              borderColor: "gainsboro",
              fontSize: 15,
              height: 40,
              textAlign: "left",
              padding: 5,
              marginBottom: 10,
            }}
            placeholder="'ABC123', 'Red', 'Front', '20W-50', '1L', 'BH6x20' "
            value={product.miscInfo}
            autoCapitalize="characters"
            onChangeText={(t) => setProduct({ ...product, miscInfo: t })}
          />
        </View>
        <View style={{ marginHorizontal: 20, flex: 1 }}>
          <Text>Suitable for Motors</Text>
          <DropDownPicker
            items={[
              ...motors.map((s) => ({
                label: s.name.replaceAll("_", " "),
                value: s.id,
                icon: () => <Text>[{s.maker.substring(0, 3)}]</Text>,
              })),
              // {
              //   label: motorQuery.toUpperCase(),
              //   value: 0,
              //   icon: () => <Icon name="add" size={20} color="red" />,
              // },
            ]}
            multiple={true}
            setValue={setSelectedMotors}
            value={selectedMotors}
            open={motorsOpen}
            setOpen={setMotorsOpen}
            textStyle={{
              fontSize: 20,
            }}
            flatListProps={{
              keyboardShouldPersistTaps: "always",
              nestedScrollEnabled: true,
            }}
            listMode="MODAL"
            style={{
              borderColor: "#ddd",
              borderRadius: 0,
              marginBottom: 5,
            }}
            // onChangeSearchText={setMotorQuery}
            placeholderStyle={{ color: "gray" }}
            placeholder="Select motors"
            searchable={true}
            searchPlaceholder="Search..."
          />
        </View>
        <View
          style={{
            marginHorizontal: 20,
            marginVertical: 5,
            padding: 10,
            flexDirection: "row",
            backgroundColor: "lightblue",
            display: selectedMotors.length > 0 ? "flex" : "none",
            flexWrap: "wrap",
            borderRadius: 20,
          }}
        >
          {selectedMotors.map((s) => (
            <View
              style={{
                backgroundColor: "lightcyan",
                borderRadius: 20,
                padding: 5,
                margin: 5,
              }}
              key={`selectedmotor-${s}`}
            >
              <Text
                style={{ fontSize: 14 }}
                onPress={() => deleteMotor(s)}
                onLongPress={() => prioritizeMotor(s)}
              >
                {motors.find((t) => t.id === s)?.name.replaceAll("_", " ")}
                {` \u00d7`}
              </Text>
            </View>
          ))}
        </View>
        <View style={{ flexDirection: "row" }}>
          <View style={{ marginLeft: 20, flex: 1 }}>
            <Text>Brand of Item</Text>
            <TextInput
              style={{
                borderWidth: 1,
                backgroundColor: "white",
                borderColor: "gainsboro",
                fontSize: 20,
                height: 40,
                textAlign: "left",
                padding: 5,
                marginBottom: 10,
              }}
              placeholder="e.g. Makoto/Takasago..."
              autoCapitalize="characters"
              value={product.brand}
              onChangeText={(t) => setProduct({ ...product, brand: t })}
            />
          </View>
          <View style={{ paddingHorizontal: 10 }}>
            <Switch
              trackColor={{ false: "gray", true: "teal" }}
              onValueChange={(t) => setProduct({ ...product, isOrig: t })}
              value={product.isOrig}
            />
            <Text style={{ textAlign: "center" }}>
              {product.isOrig ? "ORIG." : "SEMI."}
            </Text>
          </View>
        </View>

        <View style={{ marginHorizontal: 20, flexDirection: "row" }}>
          <View style={{ flex: 1 }}>
            <Text>Pieces per Package</Text>
            <TextInput
              style={{
                borderWidth: 1,
                backgroundColor: "white",
                borderColor: "gainsboro",
                fontSize: 17,
                height: 40,
                textAlign: "center",
                padding: 5,
                marginBottom: 10,
              }}
              placeholder="1, 2, 3..."
              value={product.pieces}
              keyboardType="numeric"
              onChangeText={(amt) => {
                let n = parseFloat(amt.replace(/[^.0-9]/g, ""));
                setProduct({
                  ...product,
                  pieces: isNaN(n) ? "" : n.toString(),
                  unitPP: "",
                  unitSP: "",
                  packPP: "",
                  packSP: "",
                });
              }}
            />
          </View>
          <View style={{ marginLeft: 20, flex: 1 }}>
            <Text>Package Unit</Text>
            <TextInput
              style={{
                borderWidth: 1,
                backgroundColor: "white",
                borderColor: "gainsboro",
                fontSize: 17,
                height: 40,
                textAlign: "left",
                padding: 5,
                marginBottom: 10,
              }}
              placeholder="pc."
              value={product.unit}
              onChangeText={(t) => setProduct({ ...product, unit: t })}
            />
          </View>
        </View>
        <View style={{ marginHorizontal: 20, flexDirection: "row" }}>
          <View style={{ flex: 1 }}>
            <Text>Purchase {`\u20b1`} per Piece</Text>
            <TextInput
              style={{
                borderWidth: 1,
                backgroundColor: "white",
                borderColor: "gainsboro",
                fontSize: 17,
                height: 40,
                textAlign: "left",
                padding: 5,
                marginBottom: 10,
              }}
              placeholder={`1 ${
                product.unit === "" ? "pc" : product.unit
              } = \u20b1${parseInt(
                product.unitPP !== "" ? product.unitPP : "500"
              )}`}
              value={product.unitPP}
              keyboardType="numeric"
              onChangeText={(amt) => {
                let n = parseFloat(amt.replace(/[^.0-9]/g, ""));
                setProduct({
                  ...product,
                  unitPP: isNaN(n) ? "" : n.toString(),
                  packPP: isNaN(n)
                    ? ""
                    : (
                        n *
                        parseInt(product.pieces === "" ? "1" : product.pieces)
                      ).toString(),
                });
              }}
            />
          </View>
          <View style={{ marginLeft: 20, flex: 1 }}>
            <Text>Purchase {`\u20b1`} per Set</Text>
            <TextInput
              style={{
                borderWidth: 1,
                backgroundColor: "white",
                borderColor: "gainsboro",
                fontSize: 17,
                height: 40,
                textAlign: "left",
                padding: 5,
                marginBottom: 10,
              }}
              placeholder={`${product.pieces === "" ? "1" : product.pieces} ${
                product.unit === "" ? "pc" : product.unit
              } = \u20b1${parseInt(
                product.packPP !== ""
                  ? product.packPP
                  : (
                      500 *
                      parseInt(product.pieces === "" ? "1" : product.pieces)
                    ).toString()
              )}`}
              value={product.packPP}
              keyboardType="numeric"
              onChangeText={(amt) => {
                let n = parseFloat(amt.replace(/[^.0-9]/g, ""));

                setProduct({
                  ...product,
                  unitPP: isNaN(n)
                    ? ""
                    : (n / parseInt(product.pieces)).toFixed(2),
                  packPP: isNaN(n) ? "" : n.toString(),
                });
              }}
            />
          </View>
        </View>
        <View style={{ marginHorizontal: 20, flexDirection: "row" }}>
          <View style={{ flex: 1 }}>
            <Text>Selling {`\u20b1`} per Piece</Text>
            <TextInput
              style={{
                borderWidth: 1,
                backgroundColor: "white",
                borderColor: "gainsboro",
                fontSize: 17,
                height: 40,
                textAlign: "left",
                padding: 5,
                marginBottom: 10,
              }}
              placeholder={`1 ${
                product.unit === "" ? "pc" : product.unit
              } = \u20b1${parseInt(
                product.unitSP !== "" ? product.unitSP : "600"
              )}`}
              value={product.unitSP}
              keyboardType="numeric"
              onChangeText={(amt) => {
                let n = parseFloat(amt.replace(/[^.0-9]/g, ""));
                setProduct({
                  ...product,
                  unitSP: isNaN(n) ? "" : n.toString(),
                  packSP: isNaN(n)
                    ? ""
                    : (
                        n *
                        parseInt(product.pieces === "" ? "1" : product.pieces)
                      ).toString(),
                });
              }}
            />
          </View>
          <View style={{ marginLeft: 20, flex: 1 }}>
            <Text>Selling {`\u20b1`} per Set</Text>
            <TextInput
              style={{
                borderWidth: 1,
                backgroundColor: "white",
                borderColor: "gainsboro",
                fontSize: 17,
                height: 40,
                textAlign: "left",
                padding: 5,
                marginBottom: 10,
              }}
              placeholder={`${product.pieces === "" ? "1" : product.pieces} ${
                product.unit === "" ? "pc" : product.unit
              } = \u20b1${parseInt(
                product.packSP !== ""
                  ? product.packSP
                  : (
                      600 *
                      parseInt(product.pieces === "" ? "1" : product.pieces)
                    ).toString()
              )}`}
              value={product.packSP}
              keyboardType="numeric"
              onChangeText={(amt) => {
                let n = parseFloat(amt.replace(/[^.0-9]/g, ""));
                setProduct({
                  ...product,
                  unitSP: isNaN(n)
                    ? ""
                    : (
                        n /
                        parseInt(product.pieces === "" ? "1" : product.pieces)
                      ).toFixed(2),
                  packSP: isNaN(n) ? "" : n.toString(),
                });
              }}
            />
          </View>
        </View>

        <View style={{ marginHorizontal: 20, flexDirection: "row" }}>
          <View style={{ flex: 1 }}>
            <Text>Minimum Set Count</Text>
            <TextInput
              style={{
                borderWidth: 1,
                backgroundColor: "white",
                borderColor: "gainsboro",
                fontSize: 17,
                height: 40,
                textAlign: "center",
                padding: 5,
                marginBottom: 10,
              }}
              placeholder="1, 2, 3..."
              value={product.minimum}
              keyboardType="numeric"
              onChangeText={(amt) => {
                let n = parseFloat(amt.replace(/[^.0-9]/g, ""));
                setProduct({
                  ...product,
                  minimum: isNaN(n) ? "" : n.toString(),
                });
              }}
            />
          </View>
          <View style={{ marginLeft: 20, flex: 1 }}>
            <Text>Location</Text>
            <TextInput
              style={{
                borderWidth: 1,
                backgroundColor: "white",
                borderColor: "gainsboro",
                fontSize: 17,
                height: 40,
                textAlign: "left",
                padding: 5,
                marginBottom: 10,
              }}
              placeholder="... Shelf A or A"
              autoCapitalize="characters"
              value={product.location}
              onChangeText={(t) => setProduct({ ...product, location: t })}
            />
          </View>
        </View>
        <View style={{ marginHorizontal: 20, flexDirection: "row" }}>
          <TouchableOpacity
            onPress={mode === "create" ? onCreateProduct : onUpdateProduct}
            style={{ flex: 1 }}
          >
            <View
              style={{
                borderRadius: 25,
                // marginHorizontal: 50,
                marginVertical: 10,
                borderColor: "gray",
                backgroundColor: "teal",
              }}
            >
              <Text
                style={{ color: "white", fontSize: 25, textAlign: "center" }}
              >
                {mode === "create" ? "Add Product" : "Update"}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={{ alignItems: "center" }}>
          <Text style={{ fontSize: 15 }}>
            {part === -1
              ? ""
              : `Details: ${sparePartStore.sparePartName(part)}${
                  product.miscInfo !== "" ? " " + product.miscInfo : ""
                }${
                  selectedMotors[0] &&
                  sparePartStore.spareParts.find((s) => s.id === part)
                    ?.is_motor_shown
                    ? " " +
                      motorStore
                        .motorName(selectedMotors[0])
                        ?.replaceAll("_", " ")
                    : ""
                }${product.brand !== "" ? " " + product.brand : ""}${
                  product.isOrig ? " ORIG." : ""
                }`.toUpperCase()}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};
