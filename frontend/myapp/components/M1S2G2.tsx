import { useContext } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Icon } from "react-native-elements";
import { mechanicsColors } from "../constants/constants";
import { isEqualDate, laborDueToMechanic } from "../constants/helpers";
import { M1S2Context } from "../constants/interfaces";

export const MechanicList = () => {
  const { setLaborer, laborers, laborer, laborItems, customers } =
    useContext(M1S2Context);

  return (
    <View style={styles.customerQueue}>
      <ScrollView style={styles.scrollQueue} horizontal={true}>
        {laborers.map(
          (s) =>
            laborItems
              .filter((u) => u.laborer === s)
              .filter(
                (u) =>
                  u.collected !==
                  laborDueToMechanic(
                    u.description.split(", ")[1],
                    parseFloat(`${u.cost}`)
                  )
              ).length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setLaborer(s);
                }}
                key={`laborer-${s}`}
              >
                {s === laborer ? (
                  <Icon
                    name="person-pin-circle"
                    size={65}
                    style={styles.selectedAvatar}
                    color={mechanicsColors.find((t) => t.name === s)?.color}
                    key={`sav-${s}`}
                  />
                ) : (
                  <>
                    <Icon
                      name="account-circle"
                      size={45}
                      style={styles.avatar}
                      color={mechanicsColors.find((t) => t.name === s)?.color}
                      key={`av-${s}`}
                    />
                    <Text>{s}</Text>
                  </>
                )}
              </TouchableOpacity>
            )
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollQueue: {
    height: 75,
  },
  customerQueue: {
    paddingLeft: 10,
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "lightcyan",
    zIndex: -1,
  },
  selectedAvatar: {
    marginTop: 1,
    marginHorizontal: 0,
  },

  avatar: {
    marginTop: 4,
    marginHorizontal: 3,
  },
});
