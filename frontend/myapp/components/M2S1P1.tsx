import { useCallback, useContext, useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Icon } from "react-native-elements";
import { Expense, M2S1Context } from "../constants/interfaces";
import { particularPOSStore } from "../stores/ParticularPOSStore";
import { useStore } from "../stores/Store";
import { ExpenseCategorySelector } from "./M2P2";
import DropDownPicker from "react-native-dropdown-picker";

export const CreateExpenseForm = () => {
  const [open, setOpen] = useState(false);
  const { transactionStore, categoryStore } = useStore();
  const {
    categories,
    expenses,
    viewHistory,
    setExpenses,
    setViewHistory,
    accounts,
  } = useContext(M2S1Context);

  const [account, setAccount] = useState(0);
  const [amount, setAmount] = useState("0");
  const [category, setCategory] = useState("-1");
  const [remarks, setRemarks] = useState("");
  const [spender, setSpender] = useState("");

  const setValue = (t: any) => {
    setViewHistory(false);
    setCategory(t);
  };

  const submitExpense = useCallback(async () => {
    if (!isNaN(parseFloat(amount)) && parseFloat(amount) !== 0) {
      let newTransaction = {
        category: category,
        description: "Receipt 12345",
        transmitter: `ACCT${account}`,
        receiver: spender === "" ? "-" : spender,
        particular_transaction: [],
      };

      const resp = await transactionStore.addTransaction(newTransaction);

      await particularPOSStore.addParticularPOS(
        {
          description: remarks === "" ? "-" : remarks,
          remarks: "-",
          quantity: 1,
          unit_amount: parseInt(amount),
        },
        parseInt(resp.data?.pk ?? "-1")
      );

      setExpenses((prev: Expense[]) => [
        ...prev,
        {
          id: parseInt(resp.data?.pk ?? "-1"),
          amount: parseFloat(amount),
          spender: spender === "" ? "-" : spender,
          remarks:
            remarks === ""
              ? `Expense ${categories.find((s) => s.pk === category)?.title}`
              : remarks,
          datetimeTransacted: resp.data?.datetime_transacted ?? "",
          categoryId: categoryStore.categoryName(category) ?? "",
          receiptId: "",
        },
      ]);
      setCategory("-1");
      setAmount("0");
      setSpender("");
      setRemarks("");

      setViewHistory(true);
    }
  }, [category, spender, remarks, amount, expenses]);

  useEffect(() => {
    setAccount(10);
  }, []);

  return (
    <>
      <ExpenseCategorySelector
        categories={categories}
        setValue={setValue}
        categoryId={category}
      />
      <TouchableOpacity
        onPress={() => setViewHistory((prev: boolean) => !prev)}
      >
        <View
          style={[
            styles.historyBtn,
            { display: expenses.length > 0 ? "flex" : "none" },
          ]}
        >
          <View style={{ justifyContent: "center", flex: 1 }}>
            <Text
              style={{
                fontSize: 20,
                color: "white",
                textAlign: "center",
              }}
            >
              {viewHistory ? "Hide History" : "View History"}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
      <ScrollView
        style={{
          display: category !== "-1" && !viewHistory ? "flex" : "none",
        }}
        keyboardShouldPersistTaps="always"
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View>
            <Text>Cost</Text>
            <TextInput
              style={{
                borderWidth: 1,
                backgroundColor: "white",
                width: 150,
                borderColor: "gainsboro",
                fontSize: 25,
                height: 50,
                textAlign: "center",
                padding: 10,
                marginBottom: 20,
              }}
              value={amount}
              placeholder="Set Cost"
              keyboardType="numeric"
              onChangeText={(amt) =>
                setAmount(
                  (isNaN(parseFloat(amt.replace(/[^.0-9]/g, "")))
                    ? ""
                    : amt.replace(/[^.0-9]/g, "")
                  ).toString()
                )
              }
            />
          </View>
          <Icon
            name="request-quote"
            size={70}
            color={"teal"}
            onPress={submitExpense}
          />
        </View>
        <Text>Requester (c/o):</Text>
        <TextInput
          style={{
            borderWidth: 1,
            backgroundColor: "white",
            width: 300,
            borderColor: "gainsboro",
            fontSize: 17,
            height: 40,
            padding: 10,
            marginBottom: 20,
          }}
          value={spender}
          placeholder="Requester (Optional)"
          onChangeText={(name) => setSpender(name)}
          maxLength={15}
        />
        <Text>Remarks:</Text>
        <TextInput
          style={{
            borderWidth: 1,
            backgroundColor: "white",
            width: 300,
            borderColor: "gainsboro",
            fontSize: 17,
            height: 40,
            padding: 10,
            marginBottom: 20,
          }}
          maxLength={30}
          value={remarks}
          placeholder="Remarks (Optional)"
          onChangeText={(name) => setRemarks(name)}
        />
        <Text>Account:</Text>
        <DropDownPicker
          items={accounts
            .filter((s) => !s.name.includes("UNTRACKED"))
            .map((s) => ({
              label: s.name,
              value: parseInt(s.id ?? "-1"),
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
          setValue={setAccount}
          value={account}
          open={open}
          setOpen={setOpen}
          textStyle={{
            fontSize: 15,
          }}
          style={{
            borderWidth: 1,
            backgroundColor: "white",
            width: 300,
            borderColor: "gainsboro",
            height: 40,
            padding: 10,
            marginBottom: 20,
          }}
          placeholder="See all Accounts"
          placeholderStyle={{ color: "gray" }}
          dropDownDirection="TOP"
          listMode="MODAL"
        />
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  historyBtn: {
    width: 200,
    height: 30,
    borderRadius: 25,
    borderColor: "gray",
    backgroundColor: "teal",
  },
});
