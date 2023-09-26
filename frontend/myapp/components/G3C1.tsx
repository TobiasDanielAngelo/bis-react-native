import { memo, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";

const items = [...Array(2000).keys()].map((s) => ({
  id: s,
  name: `Text ${s}`,
}));

const Item = memo((props: { id: number; name: string; selected: boolean }) => {
  return (
    <Text
      key={`text${props.id}`}
      style={{
        color: props.selected ? "red" : "black",
        margin: 5,
      }}
    >
      {props.name}
    </Text>
  );
});

export const DummyView = () => {
  const [x, setX] = useState(-1);

  return (
    <View style={{ margin: 30 }}>
      <Text>Test {x}</Text>
      <FlatList
        data={items}
        contentContainerStyle={{ flexDirection: "row", flexWrap: "wrap" }}
        renderItem={({ item }) => (
          <Pressable onPress={() => setX(item.id)}>
            <Item id={item.id} name={item.name} selected={x === item.id} />
          </Pressable>
        )}
        keyExtractor={(item) => `${item.id}`}
        maxToRenderPerBatch={50}
      />
    </View>
  );
};
