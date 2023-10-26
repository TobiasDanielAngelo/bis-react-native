import moment from "moment";
import { useContext, useEffect, useState } from "react";

import {
  M4S1Context,
  TransactionInterface,
  Transfer,
} from "../constants/interfaces";
import { Text, View, StyleSheet } from "react-native";
import { useStore } from "../stores/Store";
import { Icon } from "react-native-elements";
import { accountStore } from "../stores/AccountStore";

export const TransferItem = (props: { transfer: Transfer }) => {
  const [username, setUsername] = useState("");
  const { accounts, setTransfers } = useContext(M4S1Context);
  const { userStore, transactionStore } = useStore();

  const getUsername = async () => {
    const resp = await userStore.fetchUser(props.transfer.encoder);
    setUsername(resp.data?.username.toUpperCase() ?? "");
  };

  const onDeleteTransfer = async () => {
    setTransfers((prev: Transfer[]) => {
      prev.splice(
        prev.findIndex((s) => s.id === props.transfer.id),
        1
      );
      return [...prev];
    });

    await transactionStore.deleteTransaction(props.transfer.id.toString());
  };

  useEffect(() => {
    getUsername();
  }, [props.transfer.id]);

  return (
    <View style={[styles.listItem, styles.shadowProp]}>
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <Text style={styles.descriptionText}>
          {moment(new Date(props.transfer.datetime_transacted)).format(
            "MMM-D h:mm A"
          )}
        </Text>
        <Text style={styles.descriptionText}>{username}</Text>
      </View>
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <Text style={styles.mainItemText}>
          {`${
            accounts.find(
              (s) =>
                `${s.id}` === props.transfer.transmitter.replace("ACCT", "")
            )?.name
          } to ${
            accounts.find(
              (s) => `${s.id}` === props.transfer.receiver.replace("ACCT", "")
            )?.name
          }`}
        </Text>
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <Icon name="delete" color="gray" onPress={onDeleteTransfer} />

        <Text style={[styles.descriptionText, { fontStyle: "italic" }]}>
          {props.transfer.message.length > 0
            ? `"${props.transfer.message.substring(0, 20)}..."`
            : ""}
        </Text>
        <Text style={styles.priceText}>
          {parseFloat(`${props.transfer.amount}`).toFixed(2)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  listItem: {
    backgroundColor: "white",
    padding: 10,
    marginTop: 10,
    marginHorizontal: 10,
    marginBottom: 7,
    height: 100,
  },
  shadowProp: {
    shadowColor: "black",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 7,
    elevation: 5,
  },
  descriptionText: {
    fontSize: 15,
    textAlign: "left",
    color: "grey",
    fontFamily: "monospace",
  },
  priceText: { fontSize: 19, textAlign: "right", fontFamily: "monospace" },
  mainItemText: { fontSize: 16, textAlign: "left", fontFamily: "monospace" },
});
