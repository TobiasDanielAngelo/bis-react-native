import { PropsWithChildren, useCallback } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Overlay } from "react-native-elements";
import { winHeight, winWidth } from "../constants/constants";
import { HView } from "./HView";
import { MyIcon } from "./MyIcon";

export const MyOverlay = (
  props: PropsWithChildren<{
    isVisible: boolean;
    setVisible: (t: boolean) => void;
    title: string;
    onPressCheck?: () => void;
    actionLogo1?: string;
    actionLogo2?: string;
    onPressAction1?: () => void;
    onPressAction2?: () => void;
  }>
) => {
  const {
    isVisible,
    setVisible,
    title,
    children,
    onPressCheck,
    onPressAction1,
    onPressAction2,
    actionLogo1,
    actionLogo2,
  } = props;

  const onCheck = () => {
    onPressCheck && onPressCheck();
    setVisible(false);
  };

  const onClose = () => {
    setVisible(false);
  };

  return (
    <Overlay isVisible={isVisible}>
      <View style={styles.main}>
        <HView>
          <Text style={styles.text}>{title}</Text>
          <MyIcon
            name="close"
            noLabel
            onPress={onClose}
            color="gray"
            size="small"
          />
        </HView>
        <View style={styles.children}>{children}</View>
        <View style={styles.bar}>
          <MyIcon
            name="check"
            noLabel
            onPress={onCheck}
            color="gray"
            size="small"
          />
          <HView>
            {actionLogo1 && (
              <MyIcon
                name={actionLogo1}
                noLabel
                onPress={onPressAction1}
                color="gray"
                size="small"
              />
            )}
            {actionLogo2 && (
              <MyIcon
                name={actionLogo2}
                noLabel
                onPress={onPressAction2}
                color="gray"
                size="small"
              />
            )}
          </HView>
        </View>
      </View>
    </Overlay>
  );
};

const styles = StyleSheet.create({
  main: {
    width: winWidth * 0.85,
  },
  text: {
    fontSize: winWidth * 0.05,
    padding: 5,
  },
  bar: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
  },
  children: {
    padding: winHeight * 0.03,
  },
});
