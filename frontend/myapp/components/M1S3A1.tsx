import { useContext, useEffect, useMemo, useRef } from "react";
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
import { M1S3Context, POSItem } from "../constants/interfaces";
import { useStore } from "../stores/Store";

export const ProductSearch = (props: {}) => {
  const inputRef = useRef<TextInput>(null);

  const { productStore } = useStore();

  const {
    items,
    setItem,
    setItems,
    query,
    onQueryChange,
    focus,
    onFocusChange,
  } = useContext(M1S3Context);

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
          return s;
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
              onFocusChange(false);
            }}
          />

          {!focus && (
            <Icon
              name="search"
              size={45}
              color={"cadetblue"}
              style={{ marginRight: 5 }}
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
          data={dataMatches}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.searchResultItem}
              onPress={() => {
                setItem(item);
                onFocusChange(false);
                onQueryChange("");
              }}
              key={`match2-${item.id}`}
            >
              <Text style={styles.text} key={`match2text-${item.id}`}>
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
    backgroundColor: "cadetblue",
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
