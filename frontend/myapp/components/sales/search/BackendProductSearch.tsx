import { useContext, useEffect, useRef, useMemo, useCallback } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Icon } from "react-native-elements";
import { defaultLaborItem, winWidth } from "../../../constants/constants";
import { POSContext, POSItem } from "../../../constants/interfaces";
import { useStore } from "../../../stores/Store";

export const BackendProductSearch = (props: {}) => {
  const { particularPOSStore } = useStore();
  const inputRef = useRef<TextInput>(null);

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
  } = useContext(POSContext);

  const getProducts = async (query: string) => {
    const resp = await productStore.fetchProductByQuery(query.toUpperCase());
    setItems(
      resp.data?.map((s) => ({
        id: parseInt(s.pk),
        name: s.description,
        price: s.sell_price,
        remarks: "",
      })) ?? []
    );
  };

  const dataMatches = useMemo(
    () =>
      items.filter((s: POSItem) => {
        if (query === "") {
          return;
        } else if (
          query
            .split(/[ ,]+/)
            .every((v) => s.name.toLowerCase().includes(v.toLowerCase()))
        ) {
          return s;
        } else {
          return;
        }
      }),
    [items, query]
  );

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
      }, 10);

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
                  ? "#ccc"
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
              onFocusChange(false);
            }}
          />
          <Icon
            name="work"
            size={45}
            color={focus ? "rgb(218,218,218)" : "rgb(118,165,175)"}
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

          {!focus && <Icon name="search" size={45} color="rgb(118,165,175)" />}

          {focus && (
            <TouchableOpacity>
              <Icon
                name="close"
                size={45}
                color="rgb(118,165,175)"
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
        <FlatList
          data={dataMatches}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.searchResultItem}
              onPress={() => {
                onCreateSales(item);
                onFocusChange(false);
                onQueryChange("");
              }}
              key={`match-${item.id}`}
            >
              <Text style={styles.text} key={`${item.id}`}>
                {item.name} P{item.price}
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
    zIndex: 10000,
    top: 100,
  },
  inputContainer: {
    backgroundColor: "rgb(118,165,175)",
  },
  text: { fontFamily: "monospace" },
  textInput: {
    width: 0.7 * winWidth,
    padding: 10,
    paddingLeft: 20,
    fontSize: 18,
    color: "rgb(100,150,160)",
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
    borderColor: "rgb(118,165,175)",
    flexDirection: "row",
    backgroundColor: "white",
  },
  autocompleteContainer: {
    zIndex: 100,
    width: (5 * winWidth) / 8,
    top: 10,
  },
});
