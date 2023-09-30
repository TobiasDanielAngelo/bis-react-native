import { Text, View, ScrollView } from "react-native";

export const ProductListMatches = (props: { visible: boolean }) => {
  return (
    <View
      style={{
        flex: 1,
        display: props.visible ? "flex" : "none",
        backgroundColor: "lightblue",
      }}
    >
      <ScrollView persistentScrollbar={true}>
        <Text
          style={{
            fontSize: 20,
            margin: 10,
            textAlign: "center",
          }}
        >
          Potential Matches
        </Text>
      </ScrollView>
    </View>
  );
};
