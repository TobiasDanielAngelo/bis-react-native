import { useCallback, useContext, useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { Icon } from "react-native-elements";
import { winWidth } from "../../constants/constants";
import { Expenses, MainContext } from "../../constants/interfaces";
import { CategoryInterface } from "../../stores/CategoryStore";
import { useStore } from "../../stores/Store";
import { TouchableOpacity } from "react-native-gesture-handler";
import { formatDate } from "../../constants/helpers";
import { ExpenseHistoryItems } from "../../components/expenses/groups/ExpenseHistoryItems";

export const QuickExpenseView = (props: any) => {
  const { categoryStore, transactionStore } = useStore();

  const [open, setOpen] = useState(false);
  const [viewHistory, setViewHistory] = useState(true);
  const [amount, setAmount] = useState("0");
  const [spender, setSpender] = useState("");
  const [remarks, setRemarks] = useState("");
  const [category, setCategory] = useState("-1");
  const [expenses, setExpenses] = useState<Expenses[]>([]);
  const [categories, setCategories] = useState<CategoryInterface[]>([]);

  const { currentScreen } = useContext(MainContext);

  const getCategories = useCallback(async () => {
    const excludeTitles = ["Stocks/Parts", "Return of Sale Items", "Dollars"];
    await categoryStore.fetchCategories();
    setCategories(
      categoryStore.categories.filter(
        (s) => s.nature === "1" && !excludeTitles.includes(s.title)
      )
    );
  }, []);

  const getTransactions = useCallback(async () => {
    await transactionStore.fetchTransactions("expenses/");
    const ExpenseTransactions = transactionStore.transactions
      .map((s) => s.asJson)
      .map((s) => ({
        id: parseInt(s.pk),
        amount: s.particular_transaction
          .map((t) => t.quantity * t.unit_amount)
          .reduce((a, b) => a + b, 0),
        spender: s.receiver,
        remarks: s.description,
        datetimeTransacted: s.datetime_transacted,
        categoryId: categoryStore.categoryName(s.category) ?? "",
        receiptId: -1,
      }))
      .filter(
        (s) =>
          parseInt(formatDate(new Date(s.datetimeTransacted))) ===
          parseInt(formatDate(new Date()))
      );

    setExpenses(ExpenseTransactions);
  }, []);

  const submitExpense = useCallback(async () => {
    if (!isNaN(parseFloat(amount)) && parseFloat(amount) !== 0) {
      let newTransaction = {
        category: category,
        description:
          remarks === ""
            ? `Expense ${categories.find((s) => s.pk === category)?.title}`
            : remarks,
        transmitter: "DATS",
        receiver: spender === "" ? "-" : spender,
        particular_transaction: [
          {
            description: remarks === "" ? "-" : remarks,
            remarks: remarks === "" ? "-" : remarks,
            quantity: 1,
            unit_amount: parseInt(amount),
          },
        ],
      };

      const resp = await transactionStore.addTransaction(newTransaction);

      setExpenses((prev: Expenses[]) => [
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
          receiptId: 0,
        },
      ]);

      setCategory("-1");
      setRemarks("");
      setSpender("");
      setAmount("0");
      setViewHistory(true);
    }
  }, [category, remarks, spender, amount]);

  const deleteTransactionHistory = () => {
    transactionStore.deleteTransactionHistory();
  };

  useEffect(() => {
    if (props.visible && currentScreen === "Expenses") {
      getCategories();
      deleteTransactionHistory();
      getTransactions();

      if (true) {
        const interval = setInterval(() => {
          getTransactions();
        }, 10000);
        return () => clearInterval(interval);
      }
    }
  }, [props.visible, currentScreen]);

  return (
    props.visible && (
      <View
        style={{
          alignItems: "center",
          justifyContent: "flex-start",
          flex: 1,
        }}
      >
        <DropDownPicker
          items={[
            ...categories.map((s) => ({
              label: s.title,
              value: s.pk,
              icon: () => <Icon name={s.logo} size={50} />,
            })),
            {
              label: "Select Category...",
              value: "-1",
              icon: () => <Icon name="star" size={50} />,
            },
          ]}
          multiple={false}
          setValue={(c) => {
            setViewHistory(false);
            setCategory(c);
          }}
          value={category}
          open={open}
          setOpen={setOpen}
          textStyle={{
            fontSize: 30,
          }}
          maxHeight={500}
          style={{
            height: 100,
            width: winWidth * 0.9,
            margin: winWidth * 0.05,
          }}
          listItemContainerStyle={{
            height: 100,
            padding: 10,
          }}
          dropDownContainerStyle={{
            width: winWidth * 0.9,
            margin: winWidth * 0.05,
          }}
          searchable={true}
          searchPlaceholder="Search..."
        />
        <TouchableOpacity onPress={() => setViewHistory((prev) => !prev)}>
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
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <View>
              <Text>Cost</Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  backgroundColor: "white",
                  width: 150,
                  borderColor: "#aaa",
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
              color="rgb(0,133,119)"
              onPress={submitExpense}
            />
          </View>
          <Text>Requester (c/o):</Text>
          <TextInput
            style={{
              borderWidth: 1,
              backgroundColor: "white",
              width: 300,
              borderColor: "#aaa",
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
              borderColor: "#aaa",
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
        </ScrollView>
        {viewHistory && <ExpenseHistoryItems expenses={expenses} />}
      </View>
    )
  );
};

const styles = StyleSheet.create({
  historyBtn: {
    width: 200,
    height: 30,
    borderRadius: 25,
    borderColor: "gray",
    backgroundColor: "rgb(0,133,119)",
  },
});
