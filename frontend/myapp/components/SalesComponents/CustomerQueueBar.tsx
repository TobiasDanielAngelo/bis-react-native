import {
  StyleSheet,
  TouchableOpacity,
  View,
  ScrollView,
  Text,
} from "react-native";
import { useContext } from "react";
import { Icon } from "react-native-elements";
import { POSContext } from "../../interfaces/interfaces";

export const CustomerQueueBar = (props: any) => {
  const { customer, setCustomer, customers } = useContext(POSContext);

  return (
    <View style={styles.customerQueue}>
      <ScrollView style={styles.scrollQueue} horizontal={true}>
        {customers.map((s) => (
          <TouchableOpacity
            onPress={() => {
              setCustomer(s.id);
            }}
            key={`cust-${s.id}`}
          >
            {s.id === customer ? (
              <Icon
                name="person-pin-circle"
                size={65}
                style={styles.selectedAvatar}
                color="steelblue"
                key={`sav-${s.id}`}
              />
            ) : (
              <>
                <Icon
                  name="account-circle"
                  size={45}
                  style={styles.avatar}
                  color={
                    s.paid === "validating"
                      ? "violet"
                      : s.paid === "not paid"
                      ? "rgb(89,89,89)"
                      : "#b59410"
                  }
                  key={`av-${s.id}`}
                />
                <Text>
                  {s.name.substring(0, 5)}
                  ...
                </Text>
              </>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
      <TouchableOpacity onPress={() => props.setNamePopup(true)}>
        <Icon name="add" size={60} />
      </TouchableOpacity>
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
