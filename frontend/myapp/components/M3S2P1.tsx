import { useEffect, useState, useContext } from "react";
import {
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import {
  M3S2Context,
  MotorInterface,
  ProductInterface,
  SparePartInterface,
} from "../constants/interfaces";
import { useStore } from "../stores/Store";
import { defaultProduct } from "../constants/constants";
import { Icon } from "react-native-elements";

export const ProductForm = (props: { mode: string }) => {
  const { motorStore, sparePartStore, productStore } = useStore();
  const {
    motors,
    part,
    setPart,
    product,
    setProduct,
    selectedMotors,
    setSelectedMotors,
  } = useContext(M3S2Context);
  const [parts, setParts] = useState<SparePartInterface[]>([]);

  const [motorsOpen, setMotorsOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [showMotors, setShowMotors] = useState(true);
  const [partQuery, setPartQuery] = useState("");
  const [motorQuery, setMotorQuery] = useState("");

  const onCreateProduct = async () => {
    let details = {
      piece_count: parseInt(product.pieces),
      unit: product.unit.toUpperCase(),
      description: product.miscInfo.toUpperCase(),
      brand: product.brand.toUpperCase(),
      part: part.toString(),
      motors: selectedMotors.map((s) => motorStore.motorName(s)).join(", "),
      generic: `${sparePartStore.sparePartName(part)} ${product.miscInfo}${
        showMotors ? " " + motorStore.motorName(selectedMotors[0]) : ""
      } ${product.brand}`.toUpperCase(),
      datetime_added: new Date().toISOString(),
      is_active: true,
      location: product.location.toUpperCase(),
      purchase_price: parseFloat(product.packPP),
      sell_price: parseFloat(product.packSP),
      min_quantity: parseInt(product.minimum),
    };

    try {
      const resp = await productStore.addProduct(details);
      if (!resp.ok) return;
      setCategoryOpen(false);
      setMotorsOpen(false);
      setPart(-1);
      setProduct(defaultProduct);
      setSelectedMotors([]);
    } catch (error) {
      console.log(error);
    }
  };

  const deleteMotor = (t: number) => {
    setSelectedMotors((prev: number[]) => {
      return prev.filter((s) => s !== t);
    });
  };

  const getSpareParts = async () => {
    sparePartStore.deletePartsHistory();
    await sparePartStore.fetchSpareParts();
    setParts(sparePartStore.spareParts);
  };

  // useEffect(() => {
  //   setCategoryOpen(false);
  //   setMotorsOpen(false);
  //   setPart(-1);
  //   setProduct(defaultProduct);
  //   setSelectedMotors([]);
  // }, [props.mode]);

  useEffect(() => {
    getSpareParts();
  }, [props.mode]);

  return (
    <View
      style={{
        paddingVertical: 10,
        flex: 8,
        display: props.mode !== "" ? "flex" : "none",
      }}
    >
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
        <View style={{ flexDirection: "row" }}>
          <View style={{ marginLeft: 20, flex: 1 }}>
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
          <View style={{ paddingHorizontal: 10, alignItems: "center" }}>
            <Switch
              trackColor={{ false: "gray", true: "teal" }}
              onValueChange={setShowMotors}
              value={showMotors}
            />
            <Text style={{ textAlign: "center" }}>
              {showMotors ? "SHOWN" : "HIDDEN"}
            </Text>
          </View>
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
              <Text style={{ fontSize: 14 }} onPress={() => deleteMotor(s)}>
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
                    : (n / parseInt(product.pieces)).toString(),
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
                      ).toString(),
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
        <TouchableOpacity onPress={onCreateProduct}>
          <View
            style={{
              borderRadius: 25,
              marginHorizontal: 50,
              marginVertical: 10,
              borderColor: "gray",
              backgroundColor: "teal",
            }}
          >
            <Text style={{ color: "white", fontSize: 25, textAlign: "center" }}>
              {props.mode === "create" ? "Add Product" : "Update Product"}
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};
