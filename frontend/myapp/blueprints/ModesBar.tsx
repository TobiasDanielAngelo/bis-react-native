import { StyleSheet, View } from "react-native";
import { MyIcon } from "./MyIcon";

export const ModesBar = <
  T extends {
    id: number;
    name: string;
    label: string;
  }
>(props: {
  actions: T[];
  mode: number;
  setMode: (t: number) => void;
  hidden?: boolean;
  onPressClear?: () => void;
  noSideBtns?: boolean;
}) => {
  const { hidden, actions, mode, setMode, onPressClear, noSideBtns } = props;

  return (
    !hidden && (
      <View style={styles.main}>
        <MyIcon
          name="refresh"
          label="Clear"
          color="teal"
          onPress={onPressClear}
          hidden={mode === 0 || noSideBtns}
          size="small"
          uncut
        />
        {actions.map((s) => (
          <MyIcon
            name={s.name}
            label={s.label}
            color={s.id === mode || mode === 0 ? "teal" : "#ccc"}
            key={s.id}
            onPress={() => setMode(s.id)}
            size={mode === 0 ? "medium" : "small"}
            uncut
          />
        ))}
        <MyIcon
          name="close"
          label="Cancel"
          color="teal"
          onPress={() => setMode(0)}
          hidden={mode === 0 || noSideBtns}
          size="small"
          uncut
        />
      </View>
    )
  );
};

const styles = StyleSheet.create({
  main: {
    flexDirection: "row",
    justifyContent: "space-between",
    margin: 10,
    alignItems: "center",
  },
});
