import { StyleSheet, View } from "react-native";
import { MyIcon } from "../blueprints/MyIcon";

export const BlankView = (props: { isVisible: boolean }) => {
  const { isVisible } = props;

  return (
    isVisible && (
      <View style={styles.main}>
        <MyIcon
          name="motorcycle"
          size="large"
          label="Select a Module"
          uncut
          color="teal"
        />
      </View>
    )
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
    justifyContent: "center",
  },
});
