import { useContext } from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { Icon } from "react-native-elements";
import { Customer, M1S1Context } from "../constants/interfaces";

export const CustomerAvatar = (props: { customer: Customer }) => {
  const { setCustomer, customer } = useContext(M1S1Context);

  return (
    <TouchableOpacity
      onPress={() => {
        setCustomer(props.customer);
      }}
    >
      {customer.id === props.customer.id ? (
        <Icon
          name="person-pin-circle"
          size={65}
          style={styles.selectedAvatar}
          color="steelblue"
        />
      ) : (
        <>
          <Icon
            name="account-circle"
            size={45}
            style={styles.avatar}
            color={
              props.customer.paymentStatus === "validating"
                ? "violet"
                : props.customer.paymentStatus === "not paid"
                ? "grey"
                : "darkgoldenrod"
            }
          />
          <Text>
            {props.customer.name.substring(0, 5)}
            ...
          </Text>
        </>
      )}
    </TouchableOpacity>
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
