import { useContext, useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import { toMoney } from "../constants/helpers";
import { CashCoinReportForm } from "./M4S2P1";
import {
  AccountBalance,
  AccountInterface,
  M4S2Context,
} from "../constants/interfaces";
import moment from "moment";
import { useStore } from "../stores/Store";
import { Icon } from "react-native-elements";
import DropDownPicker from "react-native-dropdown-picker";

export const AccountsView = (props: { visible: boolean }) => {
  const { accountStore, transactionStore, particularPOSStore, categoryStore } =
    useStore();

  const [open, setOpen] = useState(false);
  const [account, setAccount] = useState("-1");
  const [accounts, setAccounts] = useState<AccountBalance[]>([]);
  const [refreshCount, setRefreshCount] = useState(0);

  const getAccounts = async () => {
    const resp = await accountStore.fetchAccounts();

    setAccounts(
      resp.data?.map((s) => ({
        account: s,
        balance: 0,
      })) ?? []
    );
  };

  const getAccountWorth = async (acct: number) => {
    let date = new Date();
    const resp = await particularPOSStore.fetchAccountBalance(
      acct.toString(),
      date
    );
    setAccounts((prev) => {
      let targetAccount = prev.find(
        (s) => parseInt(s.account.id ?? "-1") === acct
      );
      if (targetAccount) {
        targetAccount.balance = resp.data?.total ?? 0;
        return [...prev];
      }
      return prev;
    });
  };

  useEffect(() => {
    setAccount("-1");
    getAccounts();
  }, [props.visible]);

  useEffect(() => {
    if (props.visible && accounts.length > 0) {
      accounts.forEach((s) => getAccountWorth(parseInt(s.account.id ?? "-1")));
    }
  }, [props.visible, accounts.length, refreshCount]);

  return (
    <View
      style={{
        display: props.visible ? "flex" : "none",
        flex: 1,
        marginHorizontal: 10,
      }}
    >
      <View>
        <View style={{ flexDirection: "row" }}>
          <View style={{ marginLeft: 20, flex: 1 }}>
            <Text>Account</Text>
            <DropDownPicker
              items={[
                ...accounts
                  .filter(
                    (s) =>
                      !s.account.name.includes("REGISTER") &&
                      !s.account.name.includes("UNTRACKED")
                  )
                  .map((s) => ({
                    label: `${s.account.name} - ${
                      s.balance >= 0
                        ? s.balance.toFixed(2)
                        : "(" + Math.abs(s.balance).toFixed(2) + ")"
                    }`,
                    value: s.account.id ?? "-1",
                    icon:
                      s.account.name === "UNTRACKED"
                        ? () => <Icon name="disabled-by-default" />
                        : s.account.name.split(" ")[0] === "CASH"
                        ? () => <Icon name="payments" />
                        : s.account.name.split(" ")[0] === "COIN"
                        ? () => <Icon name="monetization-on" />
                        : () => <Icon name="account-balance" />,
                  })),
              ]}
              multiple={false}
              setValue={setAccount}
              value={account}
              open={open}
              setOpen={setOpen}
              textStyle={{
                fontSize: 15,
              }}
              style={{
                height: 35,
                borderColor: "#ddd",
                borderRadius: 0,
                minHeight: 35,
              }}
              placeholder="See all Accounts"
              placeholderStyle={{ color: "gray" }}
              dropDownDirection="TOP"
              listMode="MODAL"
            />
          </View>
          <View style={{ paddingHorizontal: 10, justifyContent: "center" }}>
            <Icon
              name="refresh"
              onPress={() => setRefreshCount((prev) => prev + 1)}
              size={30}
              color="teal"
            />
            <Text>Refresh</Text>
          </View>
        </View>

        <View style={{ margin: 10 }}>
          {accounts
            .filter(
              (s) =>
                !s.account.name.includes("REGISTER") &&
                !s.account.name.includes("UNTRACKED")
            )
            .map((s) => (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
                key={s.account.id}
              >
                <Text style={{ fontSize: 20 }}>{`${s.account.name}`}</Text>
                <Text style={{ fontSize: 20 }}>
                  {`${
                    s.balance >= 0
                      ? s.balance.toFixed(2)
                      : "(" + Math.abs(s.balance).toFixed(2) + ")"
                  }`}
                </Text>
              </View>
            ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  main: { flexDirection: "row", marginVertical: 5 },
  toggleBtn: {
    backgroundColor: "teal",
    marginVertical: 10,
    marginHorizontal: 10,
    borderRadius: 20,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 7,
    elevation: 5,
    flex: 1,
  },
  shadowProp: {
    shadowColor: "black",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 7,
    elevation: 5,
  },
  text: {
    padding: 5,
    fontSize: 17,
    height: 40,
    textAlign: "right",
  },
  titleText: {
    alignSelf: "flex-start",
    fontSize: 17,
    fontWeight: "bold",
  },
  input: {
    padding: 5,
    borderWidth: 1,
    width: 70,
    borderColor: "gainsboro",
    fontSize: 17,
    height: 40,
    textAlign: "center",
    backgroundColor: "white",
  },
  total: {
    fontSize: 20,
    textAlign: "center",
  },
});
