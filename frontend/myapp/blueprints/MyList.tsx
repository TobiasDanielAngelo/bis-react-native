import { observer } from "mobx-react-lite";
import { PropsWithChildren } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { winWidth } from "../constants/constants";

export const MyList = observer(
  (
    props: PropsWithChildren<{
      headNote?: string;
      hidden?: boolean;
      footNote?: string;
      flex?: number;
      scrollable?: boolean;
    }>
  ) => {
    const { headNote, footNote, hidden, flex, children, scrollable } = props;

    return (
      !hidden &&
      (!scrollable ? (
        <View style={[styles.main, { flex: flex ? flex : 1 }]}>
          {headNote && <Text style={styles.text}>{headNote}</Text>}
          {children}
          {footNote && <Text style={styles.text}>{footNote}</Text>}
        </View>
      ) : (
        <ScrollView>
          {headNote && <Text style={styles.text}>{headNote}</Text>}
          {children}
          {footNote && <Text style={styles.text}>{footNote}</Text>}
        </ScrollView>
      ))
    );
  }
);

const styles = StyleSheet.create({
  main: {},
  text: {
    fontSize: winWidth * 0.05,
    padding: 5,
  },
});
