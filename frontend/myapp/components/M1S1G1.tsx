import { useContext } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Icon } from "react-native-elements";
import { defaultCustomer } from "../constants/constants";
import { M1S1Context } from "../constants/interfaces";
import { CustomerAvatar } from "./M1S1U1";

export const CustomerQueueBar = () => {
  const { customers, setCustomer, setPopup, setRefreshCount } =
    useContext(M1S1Context);

  return (
    <View style={styles.customerQueue}>
      <Icon
        name="refresh"
        size={60}
        onPress={() => setRefreshCount((prev) => prev + 1)}
        color="teal"
      />
      <FlatList
        horizontal={true}
        style={styles.scrollQueue}
        data={customers.filter((s) => s.isClosed === false)}
        renderItem={({ item }) => (
          <CustomerAvatar customer={item} key={`custAv-${item.id}`} />
        )}
        keyExtractor={(item) => `${item.id}`}
        keyboardShouldPersistTaps="always"
      />
      <TouchableOpacity
        onPress={() => {
          setCustomer(defaultCustomer);
          setPopup("name");
        }}
      >
        <Icon name="add" size={60} color="teal" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollQueue: {
    height: 75,
  },
  customerQueue: {
    height: 75,
    paddingLeft: 10,
    flexDirection: "row",
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
