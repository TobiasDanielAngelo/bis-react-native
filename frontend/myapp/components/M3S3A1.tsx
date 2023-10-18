import { useContext, useEffect, useRef } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Icon } from "react-native-elements";
import { winWidth } from "../constants/constants";
import {
  InventoryContext,
  M3S3Context,
  OrderItem,
  ProductInterface,
} from "../constants/interfaces";
import { useStore } from "../stores/Store";

export const ProductSearch = (props: {}) => {
  const inputRef = useRef<TextInput>(null);

  const { sparePartStore, productStore, particularPurchaseStore } = useStore();

  const { items, setItems, setItem } = useContext(InventoryContext);

  const {
    query,
    onQueryChange,
    focus,
    onFocusChange,
    search,
    setSearch,
    order,
    setOrderItems,
    orderItems,
  } = useContext(M3S3Context);

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

  const getProducts = async (query: string) => {
    const resp = await productStore.fetchProductByQuery(query.toUpperCase());

    setItems(resp.data ?? []);
  };

  const onCreateOrderItem = async (product: ProductInterface) => {
    if (
      orderItems.find(
        (s) =>
          s.orderId === order && s.productId === parseInt(product.id ?? "-1")
      )
    )
      return;
    await particularPurchaseStore.addParticularPurchase(
      {
        remarks: "",
        description: `PPU${product.id}***${toProductShortName(product)}`,
        quantity: 1,
        unit_amount: 0,
      },
      order
    );

    setOrderItems((prev: OrderItem[]) => [
      ...prev,
      {
        id: Math.random(),
        productId: parseInt(product.id ?? "-1"),
        orderId: order,
        qty: 1,
        purchasePrice: 0,
        sellPrice: 0,
        brandType: "",
      },
    ]);
  };

  // const dataMatches = useMemo(
  //   () =>
  //     items.filter((s: POSItem) => {
  //       if (query === "") {
  //         return s;
  //       } else if (
  //         query
  //           .split(/[ ,]+/)
  //           .every((v) => s.name.toLowerCase().includes(v.toLowerCase()))
  //       ) {
  //         return s;
  //       } else {
  //         return;
  //       }
  //     }),
  //   [items, query]
  // );

  useEffect(() => {
    if (query !== "" && query.length > 4) {
      const getData = setTimeout(() => {
        getProducts(query);
      }, 10);

      return () => clearTimeout(getData);
    }
  }, [query]);

  useEffect(() => {
    if (!focus) {
      inputRef.current?.blur();
      return;
    }
    productStore.deleteProductHistory();
    setItems([]);
    inputRef.current?.focus();
  }, [focus]);

  return (
    <View style={[styles.container, { display: search ? "flex" : "none" }]}>
      <View style={styles.inputContainer}>
        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            ref={inputRef}
            placeholder="Product Search"
            value={query}
            onChangeText={onQueryChange}
            onFocus={(e) => {
              onFocusChange(true);
            }}
            onBlur={(e) => {
              onQueryChange("");
              onFocusChange(false);
              setSearch(false);
            }}
          />

          {!focus && (
            <Icon
              name="search"
              size={45}
              color={"cadetblue"}
              style={{ marginRight: 5 }}
              onPress={() => onFocusChange(true)}
            />
          )}

          {focus && (
            <Icon
              name="close"
              size={45}
              color={"cadetblue"}
              onPress={() => {
                inputRef.current?.blur();
              }}
            />
          )}
        </View>
      </View>
      <View
        style={[styles.searchResults, { display: focus ? "flex" : "none" }]}
      >
        <FlatList
          data={items}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.searchResultItem}
              onPress={() => {
                onCreateOrderItem(item);
                onFocusChange(false);
                onQueryChange("");
              }}
              key={`match2-${item.id}`}
            >
              <Text style={styles.text} key={`match2text-${item.id}`}>
                {toProductShortName(item)} P{item.sell_price}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => `${item.id}`}
          keyboardShouldPersistTaps="always"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    zIndex: 10,
    top: 100,
  },
  inputContainer: {
    // backgroundColor: "cadetblue",
  },
  text: { fontFamily: "monospace" },
  textInput: {
    width: 0.8 * winWidth,
    padding: 10,
    paddingLeft: 20,
    fontSize: 18,
    color: "cadetblue",
  },
  searchResultItem: {
    borderBottomWidth: 0.5,
    height: 90,
    padding: 20,
    marginHorizontal: 10,
  },
  searchResults: {
    marginTop: 0,
    backgroundColor: "white",
    borderWidth: 0.5,
    borderColor: "teal",
    marginHorizontal: winWidth * 0.1,
    width: winWidth * 0.8,
    height: 300,
  },
  inputBar: {
    marginVertical: 10,
    marginHorizontal: 10,
    borderWidth: 1,
    borderRadius: 30,
    borderColor: "cadetblue",
    flexDirection: "row",
    backgroundColor: "white",
  },
  autocompleteContainer: {
    zIndex: 100,
    width: (5 * winWidth) / 8,
    top: 10,
  },
});
