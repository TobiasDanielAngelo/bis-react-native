import { StyleSheet, View } from "react-native";
import { Text } from "react-native-elements";
import { winWidth } from "../constants/constants";
import { toMoney } from "../constants/helpers";
import { MyIcon } from "./MyIcon";

export const MyStatusBar = <
  T extends {
    name: string;
    label?: string;
    selected?: boolean;
    onPress?: () => void;
    onLongPress?: () => void;
  }
>(props: {
  leftText?: string;
  rightText?: string;
  leftAction?: () => void;
  rightAction?: () => void;
  action1?: T;
  action2?: T;
  action3?: T;
  action4?: T;
  hidden?: boolean;
  amount?: number;
}) => {
  const {
    hidden,
    amount,
    action1,
    action2,
    action3,
    action4,
    leftText,
    rightText,
    leftAction,
    rightAction,
  } = props;
  return (
    !hidden && (
      <View>
        <View style={styles.texts}>
          {leftText && (
            <Text style={styles.rightText} onPress={leftAction}>
              {leftText}
            </Text>
          )}
          {rightText && (
            <Text style={styles.leftText} onPress={rightAction}>
              {rightText}
            </Text>
          )}
        </View>
        <View style={styles.bar}>
          <View style={styles.actions}>
            {action1 && (
              <MyIcon
                name={action1.name}
                color={action1.selected ? "gold" : "white"}
                label={action1.label}
                size="medium"
                noLabel
                onPress={action1.onPress}
                onLongPress={action1.onLongPress}
              />
            )}
            {action2 && (
              <MyIcon
                name={action2.name}
                color={action2.selected ? "gold" : "white"}
                label={action2.label}
                size="medium"
                noLabel
                onPress={action2.onPress}
                onLongPress={action2.onLongPress}
              />
            )}
            {action3 && (
              <MyIcon
                name={action3.name}
                color={action3.selected ? "gold" : "white"}
                label={action3.label}
                size="medium"
                noLabel
                onPress={action3.onPress}
                onLongPress={action3.onLongPress}
              />
            )}
            {action4 && (
              <MyIcon
                name={action4.name}
                color={action4.selected ? "gold" : "white"}
                label={action4.label}
                size="medium"
                noLabel
                onPress={action4.onPress}
                onLongPress={action4.onLongPress}
              />
            )}
          </View>
          {amount ? (
            <Text style={styles.priceText}>{`\u20b1${toMoney(amount)}`}</Text>
          ) : (
            <Text style={styles.priceText}> </Text>
          )}
        </View>
      </View>
    )
  );
};

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 5,
    backgroundColor: "darkslategray",
    marginBottom: 5,
  },
  texts: {
    flexDirection: "row",
    justifyContent: "space-between",
    margin: 5,
  },
  actions: {
    flexDirection: "row",
    flex: 1,
  },
  rightText: {
    fontSize: (1 / 20) * winWidth,
  },
  leftText: {
    fontSize: (1 / 20) * winWidth,
  },
  priceText: {
    color: "white",
    fontSize: (1 / 12) * winWidth,
  },
});
