import { PropsWithChildren, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { winHeight, winWidth } from "../constants/constants";
import { toMoney } from "../constants/helpers";
import { HView } from "./HView";
import { MyIcon } from "./MyIcon";
import { observer } from "mobx-react-lite";

export const MyCard = observer(
  <
    T extends { id: number },
    U extends {
      id: number;
      text?: string | number;
      type: "main" | "sub" | string;
    },
    V extends {
      id: number;
      name: string;
      label?: string;
      position: string;
      selected?: boolean;
      onPress?: () => void;
      onLongPress?: () => void;
      color?: string;
      disabled?: boolean;
    }
  >(
    props: PropsWithChildren<{
      item: T;
      details?: U[];
      price?: number;
      quantity?: number;
      unit?: string;
      actions?: V[];
      hidden?: boolean;
      disabled?: boolean;
      flex?: boolean;
    }>
  ) => {
    const {
      hidden,
      item,
      disabled,
      actions,
      details,
      price,
      children,
      flex,
      quantity,
      unit,
    } = props;

    const [expanded, setExpanded] = useState(true);

    return (
      !hidden && (
        <View
          key={item.id}
          style={[
            styles.main,
            styles.shadow,
            {
              backgroundColor: !disabled ? "white" : "#ddd",
              flex: flex ? 1 : 0,
            },
          ]}
        >
          <View style={styles.actions}>
            {["Q1", "Q2", "Q3"].map((t) => (
              <View style={styles.subActions} key={t}>
                {actions &&
                  actions.filter((s) => s.position === t) &&
                  actions
                    .filter((s) => s.position === t)
                    .map((s) => (
                      <MyIcon
                        name={s.name}
                        label={s.label}
                        key={s.id}
                        onPress={s.onPress}
                        onLongPress={s.onLongPress}
                        disabled={s.disabled}
                        size="small"
                        color={s.color ?? "gray"}
                        noLabel
                        uncut
                      />
                    ))}
              </View>
            ))}
          </View>
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
            <HView>
              {(quantity || unit) && (
                <Text style={styles.priceText}>{`${quantity ?? ""} ${
                  unit ?? ""
                }`}</Text>
              )}
              {price || price === 0 ? (
                <Text style={styles.priceText}>{`\u20b1${toMoney(
                  parseFloat(`${price}`)
                )}`}</Text>
              ) : null}
            </HView>
          </View>
          <View style={styles.actions}>
            {["Q4", "Q5", "Q6"].map((t) => (
              <View style={styles.subActions} key={t}>
                {actions &&
                  actions.filter((s) => s.position === t) &&
                  actions
                    .filter((s) => s.position === t)
                    .map((s) => (
                      <MyIcon
                        name={s.name}
                        label={s.label}
                        key={s.id}
                        onPress={s.onPress}
                        onLongPress={s.onLongPress}
                        disabled={s.disabled}
                        size="small"
                        color={s.color ?? "gray"}
                        noLabel
                        uncut
                      />
                    ))}
              </View>
            ))}
          </View>
          {children}
          <View style={styles.actions}>
            {["Q7", "Q8", "Q9"].map((t) => (
              <View style={styles.subActions} key={t}>
                {actions &&
                  actions.filter((s) => s.position === t) &&
                  actions
                    .filter((s) => s.position === t)
                    .map((s) => (
                      <MyIcon
                        name={s.name}
                        label={s.label}
                        key={s.id}
                        onPress={s.onPress}
                        onLongPress={s.onLongPress}
                        disabled={s.disabled}
                        color={s.color ?? "gray"}
                        uncut
                      />
                    ))}
              </View>
            ))}
          </View>
        </View>
      )
    );
  }
);

const styles = StyleSheet.create({
  main: {
    // height: winHeight * 0.29,
    margin: winWidth * 0.02,
    paddingHorizontal: winHeight * 0.01,
    paddingVertical: winHeight * 0.005,
    justifyContent: "space-between",
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
  },
  subText: {
    fontSize: winWidth * 0.037,
    color: "gray",
    fontStyle: "italic",
  },
  priceText: {
    textAlign: "right",
    fontSize: winWidth * 0.05,
    marginVertical: 3,
  },
  subActions: {
    flexDirection: "row",
  },
  actions: {
    flexDirection: "row",
    margin: 1,
    justifyContent: "space-between",
  },
});
