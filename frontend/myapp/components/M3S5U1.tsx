import { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Icon } from "react-native-elements";
import { FlatList, ScrollView, TextInput } from "react-native-gesture-handler";
import {
  defaultProduct,
  defaultProductFullyQuantified,
  defaultProductQuantified,
} from "../constants/constants";
import { priceToCode } from "../constants/helpers";
import {
  InventoryContext,
  InventoryHistory,
  M3S4Context,
  MainContext,
  ProductFullyQuantified,
  ProductInterface,
} from "../constants/interfaces";
import { useStore } from "../stores/Store";
import moment from "moment";

export const InventoryHistoryItem = (props: {
  transaction: InventoryHistory;
}) => {
  const [username, setUsername] = useState("");
  const { userStore } = useStore();

  const getUsername = async () => {
    const resp = await userStore.fetchUser(props.transaction.encoder);
    setUsername(resp.data?.username.toUpperCase() ?? "");
  };

  const currentTotal = props.transaction.particulars
    .filter((s) => s.remarks === "")
    .map((s) => (s.unit_amount && s.quantity ? s.unit_amount * s.quantity : 0))
    .reduce((a, b) => a + b, 0);

  useEffect(() => {
    getUsername();
  }, [props.transaction.id]);

  return (
    <View
      style={{
        flex: 1,
      }}
    >
      <View
        style={[
          styles.listItem,
          styles.shadowProp,
          {
            display: props.transaction.id !== -1 ? "flex" : "none",
          },
        ]}
      >
        <View style={{ backgroundColor: "teal", padding: 10 }}>
          <Text style={styles.mainItemText}>
            {props.transaction.type === "count"
              ? "Inventory Check # "
              : "Purchase Order # "}
            {props.transaction.id}
          </Text>
          <Text style={styles.descriptionText}>
            {moment(new Date(props.transaction.dateTransacted)).format(
              "ddd. MMM DD, YYYY h:mm A"
            )}
          </Text>
          <Text
            style={[
              styles.descriptionText,
              {
                display: props.transaction.type == "purchase" ? "flex" : "none",
              },
            ]}
          >
            Supplier: {props.transaction.receiver}
          </Text>
          <Text
            style={[
              styles.descriptionText,
              {
                display: props.transaction.type == "purchase" ? "flex" : "none",
              },
            ]}
          >
            {`Check # ${props.transaction.checkNum.replace(
              "C#",
              ""
            )} | ${moment(new Date(props.transaction.dueDate)).format(
              "MMM-DD-YYYY"
            )}`}
          </Text>
          <Text style={styles.descriptionText}>By: {username}</Text>

          <Text
            style={[
              styles.mainItemText,
              {
                textAlign: "right",
                display: props.transaction.type === "count" ? "none" : "flex",
              },
            ]}
          >
            Total: {currentTotal.toFixed(2)}
          </Text>
        </View>
        <View
          style={{
            margin: 10,
            display:
              props.transaction.particulars.length === 0 ? "flex" : "none",
          }}
        >
          <Text style={{ margin: 10, color: "gray", fontSize: 20 }}>
            This transaction appears to be empty.
          </Text>
        </View>

        <View
          style={{
            margin: 10,
            display: props.transaction.type === "purchase" ? "flex" : "none",
          }}
        >
          <FlatList
            data={props.transaction.particulars.filter((s) => s.remarks === "")}
            renderItem={({ item }) => (
              <View style={{ marginVertical: 10, padding: 5 }}>
                <Text style={styles.priceText}>
                  {`[${item.description?.split("***")[0].replace("PPU", "")}] ${
                    item.description?.split("***")[1]
                  }`}
                </Text>
                <Text style={[styles.priceText, { textAlign: "right" }]}>
                  {`\u20b1${
                    item.quantity &&
                    item.unit_amount &&
                    (item.quantity * item.unit_amount).toFixed(2)
                  } / ${item.quantity} SET`}
                </Text>
              </View>
            )}
          />
        </View>
        <View
          style={{
            margin: 10,
            display: props.transaction.type === "count" ? "flex" : "none",
          }}
        >
          <FlatList
            data={props.transaction.particulars.filter((s) => s.remarks === "")}
            renderItem={({ item }) => (
              <View style={{ marginVertical: 10, padding: 5 }}>
                <Text style={styles.priceText}>
                  {`\u2022 ${
                    item.description?.includes("ADU") ? "Added" : "Removed"
                  } ${item.quantity} set(s) of [${item.description
                    ?.split("***")[0]
                    .replace("ADU", "")}] ${item.description?.split("***")[1]}`}
                </Text>
              </View>
            )}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  listItem: {
    backgroundColor: "white",
    // padding: 10,
    margin: 15,
    flex: 1,
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
    color: "white",
    fontFamily: "monospace",
    fontWeight: "bold",
  },
  priceText: {
    fontSize: 16,
    textAlign: "left",
    fontFamily: "monospace",
  },
  mainItemText: {
    fontSize: 18,
    textAlign: "left",
    fontFamily: "monospace",
    color: "white",
    fontWeight: "bold",
  },
});
