import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { MyDatePicker } from "../blueprints/MyDatePicker";
import { MyList } from "../blueprints/MyList";
import { SearchBar } from "../blueprints/SearchBar";
import { SearchResultList } from "../blueprints/SearchResultList";
import { ReturnCard } from "../components/ReturnCard";
import { addDays } from "../constants/helpers";
import { Product } from "../stores/ProductStore";
import { useStore } from "../stores/Store";

export const A3ReturnView = observer((props: { isVisible?: boolean }) => {
  const { isVisible } = props;

  const { productStore, sparePartStore, salesItemStore, saleStore } =
    useStore();

  const [date, setDate] = useState(new Date());
  const [query, setQuery] = useState("");
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [focus, setFocus] = useState(false);
  const [item, setItem] = useState<Product>();

  const toProductShortName = (t?: Product) => {
    return !t
      ? ""
      : `${sparePartStore.sparePartName(parseInt(t.part))}${
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

  const onPressResult = (t: Product) => {
    setItem(t);
    setFocus(false);
    setShowSearchBar(false);
    setQuery("");
  };

  const toProductName = (t: Product) => {
    return `${sparePartStore.sparePartName(parseInt(t.part))}${
      t.description !== "" ? " " + t.description : ""
    }${t.motors !== "" ? " " + t.motors : ""}${
      t.brand !== "" ? " " + t.brand : ""
    }${
      t.is_orig
        ? " ORIG."
        : sparePartStore.spareParts.find((s) => s.id === parseInt(t.part))
            ?.is_semi_shown
        ? " SEMI."
        : ""
    }`.toUpperCase();
  };

  const returnableItems = salesItemStore.salesItems
    .filter((s) => s.product === item?.id)
    .filter((s) => saleStore.getItem(s.sales)?.status !== "1");

  const productMatches = productStore.products.filter((s: Product) => {
    if (query === "") {
      return;
    } else if (
      query
        .split(/[ ,]+/)
        .every((v) => toProductName(s).toLowerCase().includes(v.toLowerCase()))
    ) {
      return s;
    } else {
      return;
    }
  });

  useEffect(() => {
    if (item)
      salesItemStore.fetchMany({
        startDate: addDays(new Date(), -1).toISOString(),
        endDate: addDays(new Date(), 1).toISOString(),
        product: item.id,
        saleStatus: "3",
      });
  }, [date, item?.id]);

  return (
    isVisible && (
      <View style={styles.main}>
        <SearchBar
          query={query}
          setQuery={setQuery}
          showSearchBar={showSearchBar}
          setShowSearchBar={setShowSearchBar}
          focus={focus}
          setFocus={setFocus}
          hasNoLabor
          hasNoBNW
        />
        <SearchResultList
          onPressItem={onPressResult}
          results={productMatches}
          hidden={!showSearchBar || !focus}
          inputFocus={focus}
          setInputFocus={setFocus}
        />

        <View style={styles.body}>
          <MyList
            hidden={showSearchBar || !item}
            headNote={`Results for ${toProductShortName(item)}`}
          >
            <FlatList
              data={returnableItems}
              renderItem={({ item }) => <ReturnCard item={item} />}
              keyboardShouldPersistTaps="always"
            />
          </MyList>
        </View>
        <View style={styles.bar}>
          <MyDatePicker
            date={date}
            setDate={setDate}
            range="past"
            size="medium"
            noIcon
          />
        </View>
      </View>
    )
  );
});
const styles = StyleSheet.create({
  main: {
    flex: 1,
  },
  body: {
    flex: 1,
    margin: 3,
  },
  bar: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
});
