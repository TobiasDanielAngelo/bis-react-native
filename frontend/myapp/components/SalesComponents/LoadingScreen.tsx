import { StyleSheet, ActivityIndicator, View } from "react-native";

export const LoadingScreen = () => {
  return (
    <View style={styles.main}>
      <ActivityIndicator size="large" color="#fff" />
    </View>
  );
};

const styles = StyleSheet.create({
  main: { flex: 1, alignItems: "center", justifyContent: "center" },
});
