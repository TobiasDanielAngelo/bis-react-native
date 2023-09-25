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
import { POSItem, RefundContext } from "../../../constants/interfaces";
import { winWidth } from "../../../constants/constants";

export const RefundProductSearch = (props: {
  disabled: boolean;
  setItem: (q: string) => void;
}) => {
  const inputRef = useRef<TextInput>(null);

  const { items, query, onQueryChange, focus, onFocusChange } =
    useContext(RefundContext);

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
            { backgroundColor: props.disabled ? "#ccc" : "white" },
          ]}
        >
          <TextInput
            style={styles.textInput}
            ref={inputRef}
            placeholder="Product Search"
            value={query}
            onChangeText={onQueryChange}
            editable={!props.disabled}
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
              color="rgb(118,165,175)"
              style={{ marginRight: 5 }}
            />
          )}

          {focus && (
            <Icon
              name="close"
              size={45}
              color="rgb(118,165,175)"
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
                props.setItem(item.name);
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
    top: 10,
  },
  inputContainer: {
    backgroundColor: "rgb(118,165,175)",
  },
  text: { fontFamily: "monospace" },
  textInput: {
    width: 0.8 * winWidth,
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
