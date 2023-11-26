import { StyleSheet, TextInput } from "react-native";
import { winHeight } from "../constants/constants";

export const MySearchInput = (props: {
  query: string;
  setQuery: (t: string) => void;
  focus?: boolean;
  setFocus?: (t: boolean) => void;
  disabled?: boolean;
}) => {
  const { query, setQuery, disabled, setFocus, focus } = props;
  return (
    <TextInput
      style={[
        styles.textInput,
        { backgroundColor: disabled ? "gainsboro" : "white" },
      ]}
      autoCapitalize={"characters"}
      placeholder="Product Search"
      value={query}
      onChangeText={setQuery}
      editable={!disabled}
      onFocus={() => setFocus && setFocus(true)}
      onBlur={() => setFocus && setFocus(false)}
    />
  );
};

const styles = StyleSheet.create({
  textInput: {
    paddingVertical: 0.015 * winHeight,
    paddingLeft: 25,
    fontSize: 0.025 * winHeight,
    color: "teal",
    backgroundColor: "white",
    flex: 1,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "black",
  },
});
