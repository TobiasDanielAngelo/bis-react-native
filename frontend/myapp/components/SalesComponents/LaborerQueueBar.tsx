import {
  StyleSheet,
  TouchableOpacity,
  View,
  ScrollView,
  Text,
} from "react-native";
import { useContext } from "react";
import { Icon } from "react-native-elements";
import { laborDueToMechanic } from "./PaymentValidationOverlay";
import { RedeemContext } from "../../interfaces/interfaces";
import { formatDate } from "../../containers/POSView";

export const LaborerQueueBar = (props: any) => {
  const { setLaborer, laborers, laborer, laborItems, customers } =
    useContext(RedeemContext);

  const mechanicsColors = [
    { color: "darkred", name: "DATS" },
    { color: "chocolate", name: "Aldo" },
    { color: "darkgoldenrod", name: "Jervin" },
    { color: "darkgreen", name: "Ping" },
    { color: "darkblue", name: "Reniel" },
    { color: "indigo", name: "Jomar" },
    { color: "darkviolet", name: "Others" },
  ];

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
                    ) ||
                  (u.collected ===
                    laborDueToMechanic(
                      u.description.split(", ")[1],
                      parseFloat(`${u.cost}`)
                    ) &&
                    formatDate(
                      new Date(
                        customers.find((t) => t.id === u.custId)
                          ?.dateTransacted ?? ""
                      )
                    ) === formatDate(new Date()))
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
    backgroundColor: "rgb(208,224,227)",
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
