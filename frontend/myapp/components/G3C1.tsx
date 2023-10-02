import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";

import PagerView from "react-native-pager-view";

export const DummyView = () => {
  return (
    <PagerView style={styles.viewPager} initialPage={0} scrollEnabled={true}>
      <View style={styles.page} key="1">
        <Text>First page</Text>
        <Text>Swipe ➡️</Text>
      </View>
      <View style={styles.page} key="2">
        <Text>Second page</Text>
      </View>
      <View style={styles.page} key="3">
        <Text>Third page</Text>
      </View>
    </PagerView>
  );
};

const styles = StyleSheet.create({
  viewPager: {
    flex: 1,
  },
  page: {
    justifyContent: "center",
    alignItems: "center",
  },
});
