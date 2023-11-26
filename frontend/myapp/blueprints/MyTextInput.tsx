import { useCallback, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { winWidth } from "../constants/constants";
import { MyIcon } from "./MyIcon";

export const MyTextInput = (props: {
  hidden?: boolean;
  label: string;
  placeholder?: string;
  value: string;
  onChangeValue: (t: string) => void;
  checkpoint?: boolean;
  checkAction?: () => Promise<void>;
  disabled?: boolean;
  flex?: number;
  numeric?: boolean;
  centered?: boolean;
  maxLength?: number;
  autoCapitalize?: boolean;
}) => {
  const {
    hidden,
    label,
    value,
    onChangeValue,
    checkAction,
    disabled,
    checkpoint,
    flex,
    numeric,
    centered,
    placeholder,
    maxLength,
    autoCapitalize,
  } = props;

  const [editable, setEditable] = useState(true);

  const onCheck = useCallback(async () => {
    if (checkAction) await checkAction();
    setEditable(false);
  }, []);

  const onEdit = useCallback(() => {
    setEditable(true);
  }, []);

  return (
    !hidden && (
      <View style={[styles.main, { flex: flex ? flex : 0 }]}>
        <View style={styles.textInput}>
          <Text>{label}</Text>
          <TextInput
            onChangeText={onChangeValue}
            value={value}
            style={[
              styles.input,
              {
                backgroundColor: editable && !disabled ? "white" : "#ddd",
                textAlign: centered ? "center" : numeric ? "right" : "left",
              },
            ]}
            editable={editable && !disabled}
            placeholder={placeholder ?? label}
            keyboardType={numeric ? "numeric" : "default"}
            maxLength={maxLength}
            autoCapitalize={autoCapitalize ? "characters" : undefined}
          />
        </View>
        {checkpoint && (
          <MyIcon
            name={!editable ? "edit" : "check"}
            noLabel
            size="medium"
            color="gray"
            onPress={!editable ? onEdit : onCheck}
          />
        )}
      </View>
    )
  );
};

const styles = StyleSheet.create({
  main: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  input: {
    borderWidth: 1,
    borderColor: "gray",
    fontSize: winWidth * 0.05,
    padding: 3,
  },
  textInput: {
    padding: 3,
    flex: 1,
  },
});
