import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActivityIndicator, Button, StyleSheet, View } from "react-native";

export const LoadingView = () => {
  return (
    <View style={styles.main}>
      <ActivityIndicator size="large" color="white" />
    </View>
  );
};

const styles = StyleSheet.create({
  main: { flex: 1, alignItems: "center", justifyContent: "center" },
});
