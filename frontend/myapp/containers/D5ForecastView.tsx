import { observer } from "mobx-react-lite";
import { StyleSheet, View } from "react-native";

export const D5ForecastView = observer((props: { isVisible?: boolean }) => {
  const { isVisible } = props;

  return (
    isVisible && (
      <View style={styles.main}>
        <View style={styles.body}></View>
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
