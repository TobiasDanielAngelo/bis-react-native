import { useContext, useEffect, useState } from "react";
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useStore } from "../stores/Store";
import { AccountInterface, M4S1Context } from "../constants/interfaces";
import DropDownPicker from "react-native-dropdown-picker";
import { Icon } from "react-native-elements";

export const TransferForm = () => {
  const { accounts, setTransfers } = useContext(M4S1Context);
  const { accountStore, transactionStore, particularPOSStore, categoryStore } =
    useStore();
  const [account1, setAccount1] = useState("-1");
  const [account2, setAccount2] = useState("-1");
  const [open1, setOpen1] = useState(false);
  const [open2, setOpen2] = useState(false);
  const [amount, setAmount] = useState("0");
  const [msg, setMsg] = useState("");

  const onCreateTransfer = async () => {
    const resp = await transactionStore.addTransaction({
      category: categoryStore.categoryId("Account to Account") ?? "-1",
      description: `AA (${account1} to ${account2})`,
      transmitter: `ACCT${account1}`,
      receiver: `ACCT${account2}`,
      particular_transaction: [],
    });

    await particularPOSStore.addParticularPOS(
      {
        description: "-",
        remarks: msg,
        quantity: 1,
        unit_amount: parseFloat(amount),
      },
      parseInt(resp.data?.pk ?? "-1")
    );

    setTransfers((prev) => [
      ...prev,
      {
        id: parseInt(resp.data?.pk ?? "-1"),
        datetime_transacted: new Date().toISOString(),
        transmitter: `ACCT${account1}`,
        receiver: `ACCT${account2}`,
        amount: parseFloat(amount),
        encoder: resp.data?.encoder ?? "",
        message: msg,
      },
    ]);

    setAccount1("-1");
    setAccount2("-1");
    setAmount("0");
    setMsg("");
  };

  return (
    <ScrollView
      keyboardShouldPersistTaps="always"
      persistentScrollbar={true}
      style={{ marginRight: 10 }}
    >
      <View style={{ flex: 1, justifyContent: "space-between" }}>
        <View style={{ marginHorizontal: 20 }}>
          <Text style={{ fontSize: 20 }}>From: </Text>
          <DropDownPicker
            items={accounts
              .filter((s) => s.id !== account2)
              .map((s) => ({
                label: s.name,
                value: s.id ?? "-1",
                icon:
                  s.name === "UNTRACKED"
                    ? () => <Icon name="disabled-by-default" />
                    : s.name.split(" ")[0] === "CASH"
                    ? () => <Icon name="payments" />
                    : s.name.split(" ")[0] === "COIN"
                    ? () => <Icon name="monetization-on" />
                    : () => <Icon name="account-balance" />,
              }))}
            multiple={false}
            setValue={setAccount1}
            value={account1}
            open={open1}
            setOpen={setOpen1}
            textStyle={{
              fontSize: 20,
            }}
            flatListProps={{
              keyboardShouldPersistTaps: "always",
              nestedScrollEnabled: true,
            }}
            listMode="MODAL"
            style={{
              borderColor: "#ddd",
              borderRadius: 0,
              marginBottom: 5,
              zIndex: 100,
            }}
            placeholderStyle={{ color: "gray" }}
          />
        </View>
        <View style={{ marginHorizontal: 20 }}>
          <Text style={{ fontSize: 20 }}>To: </Text>
          <DropDownPicker
            items={accounts
              .filter((s) => s.id !== account1)
              .map((s) => ({
                label: s.name,
                value: s.id ?? "-1",
                icon:
                  s.name === "UNTRACKED"
                    ? () => <Icon name="disabled-by-default" />
                    : s.name.split(" ")[0] === "CASH"
                    ? () => <Icon name="payments" />
                    : s.name.split(" ")[0] === "COIN"
                    ? () => <Icon name="monetization-on" />
                    : () => <Icon name="account-balance" />,
              }))}
            multiple={false}
            setValue={setAccount2}
            value={account2}
            open={open2}
            setOpen={setOpen2}
            textStyle={{
              fontSize: 20,
            }}
            flatListProps={{
              keyboardShouldPersistTaps: "always",
              nestedScrollEnabled: true,
            }}
            listMode="MODAL"
            style={{
              borderColor: "#ddd",
              borderRadius: 0,
              marginBottom: 5,
              zIndex: -1,
            }}
            placeholderStyle={{ color: "gray" }}
          />
        </View>
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 20 }}>Amount: </Text>
          <TextInput
            style={{
              padding: 10,
              borderWidth: 1,
              width: 150,
              borderColor: "gainsboro",
              fontSize: 25,
              textAlign: "right",
              backgroundColor: "white",
            }}
            value={amount}
            keyboardType="numeric"
            onChangeText={(amt) =>
              setAmount(
                (isNaN(parseFloat(amt.replace(/[^.0-9]/g, "")))
                  ? ""
                  : amt.replace(/[^.0-9]/g, "")
                ).toString()
              )
            }
            editable={account1 !== "-1" && account2 !== "-1"}
          />
        </View>

        <TouchableOpacity
          onPress={onCreateTransfer}
          disabled={
            !(
              account1 !== "-1" &&
              account2 !== "-1" &&
              amount &&
              parseFloat(amount) > 0
            )
          }
        >
          <View
            style={{
              borderRadius: 25,
              marginHorizontal: 70,
              marginVertical: 10,
              borderColor: "gray",
              backgroundColor:
                account1 !== "-1" &&
                account2 !== "-1" &&
                amount &&
                parseInt(amount) > 0
                  ? "teal"
                  : "gray",
            }}
          >
            <Text style={{ color: "white", fontSize: 25, textAlign: "center" }}>
              Transfer
            </Text>
          </View>
        </TouchableOpacity>
        <TextInput
          style={{
            padding: 10,
            margin: 10,
            borderWidth: 1,
            borderColor: "gainsboro",
            fontSize: 15,
            height: 50,
            backgroundColor: "white",
            textAlign: "left",
          }}
          value={msg}
          onChangeText={setMsg}
          multiline
          numberOfLines={4}
          maxLength={200}
          placeholder="Add a message (optional)"
        />
      </View>
    </ScrollView>
  );
};
