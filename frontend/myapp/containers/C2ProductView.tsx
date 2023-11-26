import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { ModesBar } from "../blueprints/ModesBar";
import { MyCard } from "../blueprints/MyCard";
import { MyDotPager } from "../blueprints/MyDotPager";
import { SearchBar } from "../blueprints/SearchBar";
import { SearchResultList } from "../blueprints/SearchResultList";
import { ProductForm } from "../components/ProductForm";
import { toMoney } from "../constants/helpers";
import { motorStore } from "../stores/MotorStore";
import { useStore } from "../stores/Store";
import { Product } from "../stores/ProductStore";

const defaultProduct = {
  part: -1,
  brand: "",
  pieces: "1",
  unitPP: "",
  packPP: "",
  unitSP: "",
  packSP: "",
  miscInfo: "",
  location: "",
  minimum: "",
  unit: "pc.",
  isOrig: false,
  id: -1,
};

const isSubString = (source: string, sub: string) => {
  return sub
    .split(/[ ,]+/)
    .every((v) => source.toLowerCase().includes(v.toLowerCase()));
};

const hasIntersect = (arr1: any[], arr2: any[]) => {
  return arr1.filter((s) => arr2.includes(s)).length > 0;
};

export const C2ProductView = observer((props: { isVisible?: boolean }) => {
  const { isVisible } = props;
  const { productStore, sparePartStore } = useStore();
  const [value, setValue] = useState("");
  const [index, setIndex] = useState(0);
  const [mode, setMode] = useState(0);
  const [details, setDetails] = useState(defaultProduct);
  const [motors, setMotors] = useState<number[]>([]);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [query, setQuery] = useState("");
  const [focus, setFocus] = useState(false);

  const toProductName = (t: Product) => {
    return `${sparePartStore.sparePartName(t.part)}${
      t.description !== "" ? " " + t.description : ""
    }${t.motors !== "" ? " " + t.motors : ""}${
      t.brand !== "" ? " " + t.brand : ""
    }${
      t.is_orig
        ? " ORIG."
        : sparePartStore.spareParts.find((s) => s.id === t.part)?.is_semi_shown
        ? " SEMI."
        : ""
    }`.toUpperCase();
  };

  const toProductShortName = (t?: Product) => {
    return !t
      ? ""
      : `${sparePartStore.sparePartName(t.part)}${
          t.description !== "" ? " " + t.description : ""
        }${
          t.motors !== "" &&
          sparePartStore.spareParts.find((s) => s.id === t.part)?.is_motor_shown
            ? " " + t.motors.split(", ")[0].replaceAll("_", " ")
            : ""
        }${t.brand !== "" ? " " + t.brand : ""}${
          t.is_orig
            ? " ORIG."
            : sparePartStore.spareParts.find((s) => s.id === t.part)
                ?.is_semi_shown
            ? " SEMI."
            : ""
        }`.toUpperCase();
  };

  const productMatches = productStore.products.filter((s: Product) => {
    if (query === "") {
      return;
    } else if (isSubString(toProductName(s), query)) {
      return s;
    } else {
      return;
    }
  });

  const similarProducts = productStore.products.filter(
    (s) =>
      s.part === details.part &&
      isSubString(s.brand, details.brand) &&
      isSubString(s.description, details.miscInfo) &&
      (!details.isOrig || s.is_orig === details.isOrig) &&
      (motors.length === 0
        ? true
        : hasIntersect(
            s.motors.split(", ").map((t) => motorStore.motorId(t)),
            motors
          ))
  );

  const shownProduct = similarProducts.find((s, ind) => ind === index);

  const onPressClear = () => {
    setDetails(defaultProduct);
    setMotors([]);
  };

  const onPressResult = (item: Product) => {
    setDetails({
      part: item.part,
      brand: item.brand,
      pieces: item.piece_count.toString(),
      unitPP: toMoney(item.purchase_price / item.piece_count).toString(),
      packPP: toMoney(item.purchase_price).toString(),
      unitSP: toMoney(item.sell_price / item.piece_count).toString(),
      packSP: toMoney(item.sell_price).toString(),
      miscInfo: item.description,
      location: item.location,
      minimum: item.min_quantity.toString(),
      unit: item.unit,
      isOrig: item.is_orig,
      id: item.id,
    });
    setMotors(
      item.motors !== ""
        ? item.motors
            .split(", ")
            .map((s) => motorStore.motorId(s) ?? Math.random())
        : []
    );
    setFocus(false);
    setQuery("");
    setShowSearchBar(false);
  };

  useEffect(() => {
    onPressClear();
  }, [mode]);

  useEffect(() => {
    setIndex(0);
  }, [similarProducts.length]);

  return (
    isVisible && (
      <View style={styles.main}>
        <ModesBar
          actions={[
            { id: 1, name: "add", label: "Create" },
            { id: 2, name: "create", label: "Update" },
          ]}
          mode={mode}
          setMode={setMode}
          onPressClear={onPressClear}
        />
        <SearchBar
          query={query}
          setQuery={setQuery}
          showSearchBar={showSearchBar}
          setShowSearchBar={setShowSearchBar}
          focus={focus}
          setFocus={setFocus}
          hidden={mode !== 2}
          hasNoLabor
          hasNoBNW
          hasNoDate
          small={!focus}
        />
        <SearchResultList
          onPressItem={onPressResult}
          results={productMatches}
          hidden={!showSearchBar || !focus}
          inputFocus={focus}
          setInputFocus={setFocus}
        />
        <ProductForm
          hidden={
            (mode !== 1 && mode !== 2) ||
            focus ||
            (mode === 2 && details.part === -1)
          }
          mode={mode}
          details={details}
          setDetails={setDetails}
          motors={motors}
          setMotors={setMotors}
        />

        <MyDotPager
          length={similarProducts.length}
          index={index}
          setIndex={setIndex}
          hidden={(mode !== 1 && mode !== 2) || similarProducts.length <= 1}
        />
        <MyCard
          item={{ id: 1 }}
          hidden={(mode !== 1 && mode !== 2) || similarProducts.length === 0}
          details={[
            { id: 1, text: "Similar Item", type: "sub" },
            { id: 2, text: toProductShortName(shownProduct), type: "main" },
          ]}
        />
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
  },
  bar: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
});
