import { useCallback, useContext, useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ViewProductItem } from "./M3S2U2";
import {
  InventoryContext,
  M3S2Context,
  ProductInterface,
  SparePartInterface,
} from "../constants/interfaces";
import { useStore } from "../stores/Store";
import DropDownPicker from "react-native-dropdown-picker";
import { Icon } from "react-native-elements";
import { FlatList } from "react-native-gesture-handler";

export const ViewProducts = () => {
  const { setPart, part, mode, setMode, setItem } =
    useContext(InventoryContext);
  const { productStore, sparePartStore } = useStore();
  const [products, setProducts] = useState<ProductInterface[]>([]);
  const [productId, setProductId] = useState("-1");
  const [parts, setParts] = useState<SparePartInterface[]>([]);
  const [categoryOpen, setCategoryOpen] = useState(false);

  const getSpareParts = async () => {
    await sparePartStore.fetchSpareParts();
    setParts(sparePartStore.spareParts);
  };

  const getProducts = useCallback(async () => {
    if (part !== -1) {
      const resp = (
        await productStore.fetchProductByProps(
          "",
          sparePartStore.sparePartName(part),
          [],
          ""
        )
      ).data;
      setProducts(resp ?? []);
    } else {
      setProducts([]);
    }
  }, [part]);

  useEffect(() => {
    getSpareParts();
  }, []);

  useEffect(() => {
    getProducts();
  }, [part]);

  return (
    <>
      {mode === "view" && (
        <>
          <View style={{ marginHorizontal: 20 }}>
            <Text>Item Category</Text>
            <DropDownPicker
              items={parts.map((s) => ({
                label: s.name,
                value: s.id,
                icon: () => <Icon name="inventory" size={20} />,
              }))}
              multiple={false}
              setValue={setPart}
              value={part}
              open={categoryOpen}
              setOpen={setCategoryOpen}
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
          <FlatList
            data={products}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  if (productId === "-1" || productId !== item.id)
                    setProductId(item.id ?? "-1");
                  else setProductId("-1");
                }}
                onLongPress={() => {
                  setItem(item);
                  setMode("update");
                }}
              >
                <ViewProductItem
                  product={item}
                  selected={productId === item.id}
                />
              </TouchableOpacity>
            )}
          />
        </>
      )}
    </>
  );
};
