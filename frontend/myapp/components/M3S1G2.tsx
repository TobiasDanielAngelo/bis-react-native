import { useContext, useState, useEffect } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import Dots from "react-native-dots-pagination";
import { Icon } from "react-native-elements";
import { M3S1Context } from "../constants/interfaces";
import { OrderProductItem } from "./M3S1U2";
import DropDownPicker from "react-native-dropdown-picker";

export const OrderProductMatches = () => {
  const { parts, setPart, products, loading, part } = useContext(M3S1Context);

  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setIndex(parts.map((s) => s.id).indexOf(part));
  }, [part]);

  return (
    <View style={{ flex: 1, marginBottom: 10 }}>
      <View style={{ marginHorizontal: 20 }}>
        <Text>Item Category</Text>
        <DropDownPicker
          items={parts.map((s) => ({
            label: s.name,
            value: s.id,
            icon: () => <Icon name="inventory" size={20} />,
          }))}
          multiple={false}
          setValue={setPart}
          value={part}
          open={open}
          setOpen={setOpen}
          textStyle={{
            fontSize: 17,
          }}
          flatListProps={{
            keyboardShouldPersistTaps: "always",
            nestedScrollEnabled: true,
          }}
          listMode="MODAL"
          style={{
            borderColor: "#ddd",
            borderRadius: 0,
            marginBottom: 5,
          }}
          placeholderStyle={{ color: "gray" }}
          placeholder="Select a part"
          searchable={true}
          searchPlaceholder="Search..."
        />
      </View>
      <View
        style={{
          margin: 10,
          flexDirection: "row",
          justifyContent: "center",
        }}
      >
        <Icon
          name="navigate-before"
          onPress={
            index > 0
              ? () => {
                  setPart(parts.find((s, ind) => ind === index - 1)?.id ?? -1);
                  setIndex((prev) => prev - 1);
                }
              : () => {}
          }
        />
        <View>
          <Dots
            length={parts.length}
            active={index}
            passiveColor="lightgray"
            activeColor="teal"
          />
        </View>
        <Icon
          name="navigate-next"
          onPress={
            index < parts.length - 1
              ? () => {
                  setPart(parts.find((s, ind) => ind === index + 1)?.id ?? -1);
                  setIndex((prev) => prev + 1);
                }
              : () => {}
          }
        />
      </View>
      {!loading && (
        <FlatList
          data={products}
          renderItem={({ item }) => (
            <OrderProductItem productQuantified={item} />
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  viewPager: {
    flex: 1,
  },
  page: {
    justifyContent: "flex-start",
    alignItems: "center",
  },
});
