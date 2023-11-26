import { PropsWithChildren } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { HView } from "./HView";
import { MyButton } from "./MyButton";

export const MyForm = (
  props: PropsWithChildren<{
    hidden?: boolean;
    btn1Label?: string;
    btn2Label?: string;
    onPressBtn1?: () => void;
    onPressBtn2?: () => void;
    noBtn1?: boolean;
    noBtn2?: boolean;
  }>
) => {
  const {
    hidden,
    onPressBtn1,
    onPressBtn2,
    children,
    btn1Label,
    btn2Label,
    noBtn1,
    noBtn2,
  } = props;

  return (
    !hidden && (
      <View style={styles.main}>
        <ScrollView keyboardShouldPersistTaps="always">
          {children}
          <HView>
            <MyButton
              label={btn1Label ? btn1Label : "Submit"}
              onPress={onPressBtn1}
              flex
              hidden={noBtn1}
            />
            <MyButton
              label={btn2Label ? btn2Label : "Cancel"}
              color="darkred"
              onPress={onPressBtn2}
              flex
              hidden={noBtn2}
            />
          </HView>
        </ScrollView>
      </View>
    )
  );
};

const styles = StyleSheet.create({
  main: { margin: 5, padding: 5, flex: 1 },
});
