import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { HView } from "../blueprints/HView";
import { MyDotPager } from "../blueprints/MyDotPager";
import { MyDropdownPicker } from "../blueprints/MyDropdownPicker";
import { MyDropdownPickers } from "../blueprints/MyDropdownPickers";
import { CheckCard } from "../components/CheckCard";
import { useStore } from "../stores/Store";

const removeDuplicates = (data: any[]) => {
  return [...new Set(data)];
};

const hasIntersect = (arr1: any[], arr2: any[]) => {
  return arr1.filter((s) => arr2.includes(s)).length > 0;
};

export const C4CheckView = observer((props: { isVisible?: boolean }) => {
  const { isVisible } = props;

  const { productStore, sparePartStore, motorStore } = useStore();

  const [location, setLocation] = useState("");
  const [part, setPart] = useState(-1);
  const [motors, setMotors] = useState<number[]>([]);
  const [index, setIndex] = useState(0);

  const allLocations = removeDuplicates(
    productStore.products.map((s) => s.location)
  ).sort((a, b) => (a >= b ? 1 : -1));

  const productsByLocation = productStore.products
    .filter((s) => s.location === location)
    .sort((a, b) =>
      new Date(a.datetime_updated).getTime() >
      new Date(b.datetime_updated).getTime()
        ? 1
        : -1
    )
    .sort((a, b) => (a.part > b.part ? 1 : a.part === b.part ? 0 : -1));

  const allPartsByLocation = removeDuplicates(
    productsByLocation.map((s) => s.part)
  ).sort((a, b) => (a >= b ? 1 : -1));

  const currentProducts = productsByLocation
    .filter((s) => (part === -1 ? true : part === parseInt(s.part)))
    .filter((s) =>
      motors.length === 0
        ? true
        : hasIntersect(
            motors,
            s.motors.split(", ").map((s) => motorStore.motorId(s))
          )
    )
    .slice(4 * index, 4 * (index + 1));

  useEffect(() => {
    setIndex(0);
  }, [location, part, motors]);

  return (
    isVisible && (
      <View style={styles.main}>
        <HView>
          <MyDropdownPicker
            items={allLocations.map((s) => ({ value: s, label: `Shelf ${s}` }))}
            value={location}
            setValue={setLocation}
            label="Filter by Location"
            flex
          />
          <MyDropdownPicker
            items={[
              { value: -1, label: "ALL PARTS" },
              ...allPartsByLocation.map((s) => ({
                value: s,
                label: sparePartStore.sparePartName(s),
              })),
            ]}
            value={part}
            setValue={setPart}
            label="Filter by Part"
            flex
          />
        </HView>
        <MyDropdownPickers
          items={motorStore.motors.map((s) => ({
            value: s.id,
            label: s.name.replaceAll("_", " "),
          }))}
          values={motors}
          setValues={setMotors}
          label="Filter by Motor(s)"
        />
        <MyDotPager
          length={Math.ceil(productsByLocation.length / 4)}
          index={index}
          setIndex={setIndex}
          hidden={productsByLocation.length <= 4}
        />
        <View style={styles.body}>
          <FlatList
            data={currentProducts}
            renderItem={({ item }) => <CheckCard item={item} />}
            keyboardShouldPersistTaps="always"
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
  },
  bar: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
});
