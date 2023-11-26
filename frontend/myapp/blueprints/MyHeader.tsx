import { PropsWithChildren } from "react";
import { StyleSheet, Text, View } from "react-native";
import { winHeight, winWidth } from "../constants/constants";

export const MyHeader = <
  U extends { id: number; text: string; type: "main" | "sub" | string }
>(
  props: PropsWithChildren<{
    details?: U[];
    hidden?: boolean;
    flex?: boolean;
  }>
) => {
  const { hidden, details, flex } = props;

  return (
    !hidden && (
      <View
        style={[
          styles.main,
          styles.shadow,
          {
            flex: flex ? 1 : 0,
          },
        ]}
      >
        <View style={styles.texts}>
          {details &&
            details.map((s) => (
              <Text
                style={s.type === "main" ? styles.text : styles.subText}
                key={s.id}
              >
                {s.text}
              </Text>
            ))}
        </View>
      </View>
    )
  );
};

const styles = StyleSheet.create({
  main: {
    marginTop: winWidth * 0.02,
    marginHorizontal: winWidth * 0.02,
    paddingHorizontal: winHeight * 0.01,
    paddingVertical: winHeight * 0.005,
    justifyContent: "space-between",
    backgroundColor: "teal",
  },
  shadow: {
    shadowColor: "black",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 7,
    elevation: 5,
  },
  texts: {
    marginVertical: 3,
  },
  text: {
    fontSize: winWidth * 0.045,
    color: "white",
  },
  subText: {
    fontSize: winWidth * 0.037,
    color: "white",
    fontStyle: "italic",
  },
});
