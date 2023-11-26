import { FlatList, StyleSheet, View } from "react-native";
import { winHeight } from "../constants/constants";
import { useStore } from "../stores/Store";
import { MatchCard } from "./MatchCard";
import { Product } from "../stores/ProductStore";

export const SearchResultList = (props: {
  onPressItem?: (item: Product) => void;
  hidden: boolean;
  inputFocus?: boolean;
  setInputFocus?: (t: boolean) => void;
  results: Product[];
}) => {
  const { results, hidden, onPressItem } = props;

  const { sparePartStore } = useStore();

  const toProductShortName = (t: Product) => {
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

  const onPress = (t: Product) => {
    onPressItem && onPressItem(t);
  };

  return (
    !hidden && (
      <View style={styles.main}>
        <FlatList
          data={results}
          renderItem={({ item }) => (
            <MatchCard
              item={{ id: item.id }}
              mainText={toProductShortName(item)}
              subText={`SKU # ${item.id}`}
              commentText={`Shelf ${item.location}`}
              price={item.sell_price}
              key={item.id}
              onPress={() => onPress(item)}
            />
          )}
          initialNumToRender={4}
          keyboardShouldPersistTaps="always"
        />
      </View>
    )
  );
};

const styles = StyleSheet.create({
  main: {
    margin: 10,
    height: 0.4 * winHeight,
    fontSize: 18,
    color: "teal",
    backgroundColor: "white",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "black",
  },
});
