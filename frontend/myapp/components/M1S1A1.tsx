import { useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Icon } from "react-native-elements";
import { defaultPOSItem, winWidth } from "../constants/constants";
import {
  M1S1Context,
  POSItem,
  ProductInterface,
} from "../constants/interfaces";
import { useStore } from "../stores/Store";
import { sparePartStore } from "../stores/SparePartStore";
import { LoadingView } from "./G2C1";

export const ProductSearch = (props: {}) => {
  const { particularPOSStore } = useStore();
  const inputRef = useRef<TextInput>(null);
  const [loading, setLoading] = useState(false);

  const { productStore } = useStore();

  const {
    query,
    onQueryChange,
    focus,
    onFocusChange,
    customer,
    items,
    setItems,
    setPopup,
    setSalesItems,
    salesItems,
  } = useContext(M1S1Context);

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

  const getProducts = async (query: string) => {
    setLoading(true);
    const resp = await productStore.fetchProductByQuery(query.toUpperCase());

    setItems(
      resp.data?.map((s) => ({
        id: parseInt(s.id ?? "-1"),
        name: toProductShortName(s),
        price: s.sell_price,
        quantity: -1,
      })) ?? []
    );

    if (resp.data?.length && resp.data.length < 10) {
      resp.data.forEach((s) => {
        getQuantities(parseInt(s.id ?? "-1"));
      });
    }

    setLoading(false);
  };

  const getQuantities = async (itemId: number) => {
    setLoading(true);

    const resp = await particularPOSStore.fetchPOSQuantityOfProduct(itemId);

    setItems((prev: POSItem[]) => {
      if ((prev.find((s) => s.id === itemId) ?? defaultPOSItem).quantity === -1)
        (prev.find((s) => s.id === itemId) ?? defaultPOSItem).quantity =
          resp.data?.quantity ?? 0;
      return [...prev];
    });
    setLoading(false);
  };

  const onCreateSales = useCallback(
    async (item: POSItem) => {
      if (
        !salesItems.some(
          (s) => s.custId === customer.id && s.itemId === item.id
        )
      ) {
        const resp = await particularPOSStore.addParticularPOS(
          {
            remarks: "",
            description: `SKU${item.id}***${item.name}`,
            quantity: 1,
            unit_amount: item.price,
          },
          customer.id
        );

        setSalesItems((prev) => [
          ...prev,
          {
            id: parseInt(resp.data?.id ?? "-1"),
            itemId: item.id,
            itemDescription: item.name,
            custId: customer.id,
            claimed: false,
            unitAmount: item.price,
            qty: 1,
          },
        ]);
      }
    },
    [customer, salesItems]
  );

  useEffect(() => {
    if (query !== "" && query.length > 4) {
      const getData = setTimeout(() => {
        getProducts(query);
      }, 100);

      return () => clearTimeout(getData);
    }
  }, [query]);

  useEffect(() => {
    if (!focus) {
      inputRef.current?.blur();
      return;
    }
    inputRef.current?.focus();
  }, [focus]);

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <View
          style={[
            styles.inputBar,
            {
              backgroundColor:
                customer.id === -1 || customer.paymentStatus !== "not paid"
                  ? "gainsboro"
                  : "white",
            },
          ]}
        >
          <TextInput
            style={styles.textInput}
            autoCapitalize={"characters"}
            ref={inputRef}
            placeholder="Product Search"
            value={query}
            onChangeText={onQueryChange}
            editable={
              !(customer.id === -1 || customer.paymentStatus !== "not paid")
            }
            onFocus={(e) => {
              onFocusChange(true);
            }}
            onBlur={(e) => {
              onQueryChange("");
              onFocusChange(false);
            }}
          />
          <Icon
            name="work"
            size={45}
            color={focus ? "gainsboro" : "cadetblue"}
            onPress={() => {
              if (
                !focus &&
                customer?.id !== -1 &&
                customer.paymentStatus === "not paid"
              ) {
                onFocusChange(false);
                setPopup("labor");
              }
            }}
          />

          {!focus && <Icon name="search" size={45} color={"cadetblue"} />}

          {focus && (
            <TouchableOpacity>
              <Icon
                name="close"
                size={45}
                color={"cadetblue"}
                onPress={() => {
                  onQueryChange("");
                  inputRef.current?.blur();
                }}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View
        style={[
          styles.searchResults,
          { display: focus && query !== "" ? "flex" : "none" },
        ]}
      >
        {loading ? (
          <View style={{ flex: 1, justifyContent: "center" }}>
            <ActivityIndicator size="large" color="teal" />
          </View>
        ) : (
          <FlatList
            data={items}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.searchResultItem,
                  {
                    // backgroundColor: item.quantity <= 0 ? "#ddd" : "white",
                  },
                ]}
                onPress={() => {
                  onCreateSales(item);
                  onFocusChange(false);
                  onQueryChange("");
                }}
                key={`match-${item.id}`}
                disabled={item.quantity <= 0}
              >
                <Text
                  style={[
                    styles.text,
                    { color: item.quantity <= 0 ? "#888" : "black" },
                  ]}
                  key={`itemname-${item.id}`}
                >
                  {item.name}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={styles.quantityText} key={`itemqty-${item.id}`}>
                    {item.quantity !== -1
                      ? item.quantity > 0
                        ? `Qty: ${item.quantity} sets.`
                        : "Out of stock."
                      : ""}
                  </Text>
                  <Text
                    style={[
                      styles.priceText,
                      { color: item.quantity <= 0 ? "#888" : "black" },
                    ]}
                    key={`itemprice-${item.id}`}
                  >
                    P{item.price}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => `${item.id}`}
            keyboardShouldPersistTaps="always"
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    zIndex: 10000,
    top: 100,
  },
  inputContainer: {
    backgroundColor: "cadetblue",
  },
  text: { fontFamily: "monospace" },
  quantityText: { fontFamily: "monospace", color: "gray" },
  priceText: { fontFamily: "monospace" },
  textInput: {
    width: 0.7 * winWidth,
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
    marginTop: 10,
    backgroundColor: "white",
    borderWidth: 0.5,
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
