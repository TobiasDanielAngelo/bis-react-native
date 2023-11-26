import { StyleSheet, View } from "react-native";

export const BlankView = (props: { isVisible: boolean }) => {
  const { isVisible } = props;

  return isVisible && <View style={styles.main}></View>;
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
  },
});
