import { useCallback, useEffect, useState } from "react";
import { useStore } from "../stores/Store";
import { winWidth } from "../constants/Constants";
import { CategoryInterface } from "../stores/CategoryStore";
import DropDownPicker from "react-native-dropdown-picker";
import { Icon } from "react-native-elements";
import { ScrollView, Text, TextInput, View } from "react-native";
import { ExpenseHistoryTable } from "../components/ExpenseComponents/ExpenseHistoryTable";
import { Expenses } from "../interfaces/interfaces";

export const QuickExpenseView = (props: any) => {
  const { categoryStore, transactionStore } = useStore();

  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("0");
  const [spender, setSpender] = useState("");
  const [remarks, setRemarks] = useState("");
  const [category, setCategory] = useState("-1");
  const [expenses, setExpenses] = useState<Expenses[]>([]);
  const [categories, setCategories] = useState<CategoryInterface[]>([]);

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
        categoryId: s.category,
        receiptId: -1,
      }));

    setExpenses(ExpenseTransactions);
  }, []);

  const submitExpense = useCallback(async () => {
    if (!isNaN(parseFloat(amount)) && parseFloat(amount) !== 0) {
      let newTransaction = {
        category: category,
        description: `Expense ${
          categories.find((s) => s.pk === category)?.title
        }`,
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
          spender: spender,
          remarks: remarks,
          datetimeTransacted: resp.data?.datetime_transacted ?? "",
          categoryId: category,
          receiptId: 0,
        },
      ]);

      setCategory("-1");
      setRemarks("");
      setSpender("");
      setAmount("0");
    }
  }, [category, remarks, spender]);

  const deleteTransactionHistory = () => {
    transactionStore.deleteTransactionHistory();
  };

  useEffect(() => {
    if (props.visible) {
      deleteTransactionHistory();
      getTransactions();

      if (true) {
        const interval = setInterval(() => {
          getTransactions();
        }, 10000);
        return () => clearInterval(interval);
      }
    }
  }, [props.visible]);

  useEffect(() => {
    getCategories();
  }, []);

  useEffect(() => {
    if (props.visible) {
      // setAmount("0");
      // setCategory("-1");
    }
  }, [props.visible]);

  return (
    props.visible && (
      <View style={{ alignItems: "center", flex: 1 }}>
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
          setValue={setCategory}
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
        <ScrollView
          style={{ display: category !== "-1" ? "flex" : "none" }}
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
        <ExpenseHistoryTable expenses={expenses} />
      </View>
    )
  );
};
