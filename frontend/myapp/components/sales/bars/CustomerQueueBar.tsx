import { useContext } from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import { Icon } from "react-native-elements";
import { defaultCustomer } from "../../../constants/constants";
import { POSContext } from "../../../constants/interfaces";
import { CustomerAvatar } from "../units/CustomerAvatar";

export const CustomerQueueBar = () => {
  const { customers, setCustomer, setPopup } = useContext(POSContext);

  return (
    <View style={styles.customerQueue}>
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
    height: 75,
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
