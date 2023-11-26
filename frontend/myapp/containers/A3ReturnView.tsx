import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { MyDatePicker } from "../blueprints/MyDatePicker";
import { SearchBar } from "../blueprints/SearchBar";
import { SearchResultList } from "../blueprints/SearchResultList";
import { ReturnList } from "../components/ReturnList";
import { addDays } from "../constants/helpers";
import { useStore } from "../stores/Store";
import { Product } from "../stores/ProductStore";

export const A3ReturnView = observer((props: { isVisible?: boolean }) => {
  const { isVisible } = props;

  const { product2Store, sparePartStore, salesItemStore, saleStore } =
    useStore();

  const [date, setDate] = useState(new Date());
  const [query, setQuery] = useState("");
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [focus, setFocus] = useState(false);
  const [item, setItem] = useState<Product>();

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

  const productMatches = product2Store.products.filter((s: Product) => {
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
          <ReturnList
            items={returnableItems}
            title={item ? `Results for ${toProductShortName(item)}` : ""}
            hidden={showSearchBar}
          />
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
