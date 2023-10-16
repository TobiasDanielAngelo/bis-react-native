import moment from "moment";
import { useCallback, useContext } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Icon } from "react-native-elements";
import { defaultCustomer, winWidth } from "../constants/constants";
import {
  Customer,
  M1S1Context,
  MainContext,
  TransactionUpdateInterface,
} from "../constants/interfaces";
import { useStore } from "../stores/Store";

export const StatusOrderBar = (props: {}) => {
  const { currentUser } = useContext(MainContext);
  const { transactionStore } = useStore();

  return (
    <View
      style={{
        backgroundColor: "lightcyan",
        paddingTop: 10,
      }}
    >
      <Text style={{ marginLeft: 10 }}>Hello</Text>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={{ fontSize: 18, marginLeft: 10 }}>Name</Text>
        <Icon name="edit" size={25} onPress={() => {}} />
        <Text style={styles.paymentStatusText}>Boom</Text>
      </View>
      <View style={[styles.processBar]}>
        <View
          style={{
            flexDirection: "row",
            flex: 1,
            alignItems: "center",
          }}
        >
          <Icon
            name="print"
            size={40}
            style={styles.printBtn}
            color={"white"}
            onPress={() => {}}
          />
          <Icon
            name="payments"
            size={40}
            style={styles.payBtn}
            color="white"
            onPress={() => {}}
          />
          <Icon
            name="undo"
            size={40}
            style={styles.payBtn}
            color="white"
            onPress={() => {}}
          />
          <Icon
            name="close"
            size={40}
            style={styles.payBtn}
            color="white"
            onPress={() => {}}
          />
          <Icon
            name="star"
            size={40}
            style={styles.payBtn}
            color={"gold"}
            onPress={() => {}}
            onLongPress={() => {}}
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: "white",
              fontSize: winWidth / 12,
              flex: 1,
              marginRight: 20,
              textAlign: "right",
              fontFamily: "monospace",
            }}
          >
            {`\u20b1`}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  processBar: {
    backgroundColor: "darkslategray",
    height: 50,
    marginVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  paymentStatusText: {
    fontSize: 18,
    marginRight: 10,
    flex: 1,
    textAlign: "right",
  },
  printBtn: {
    marginLeft: 20,
    margin: 5,
  },
  payBtn: {
    margin: 5,
  },
});
