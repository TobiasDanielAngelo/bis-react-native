import DateTimePicker from "@react-native-community/datetimepicker";
import { useCallback, useContext, useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Icon } from "react-native-elements";
import {
  Customer,
  CustomerLaborItem,
  CustomerSalesItem,
  Item,
  MainContext,
  ReviewContext,
} from "../../constants/interfaces";
import { useStore } from "../../stores/Store";
import { formatDate } from "../../constants/helpers";
import { defaultCustomer } from "../../constants/constants";
import { CustomerViewItem } from "../../components/sales/units/CustomerViewItem";

export const ReviewView = (props: any) => {
  const [date, setDate] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [salesItems, setSalesItems] = useState<CustomerSalesItem[]>([]);
  const [laborItems, setLaborItems] = useState<CustomerLaborItem[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customer, setCustomer] = useState<Customer>(defaultCustomer);
  const [loading, setLoading] = useState(false);
  const [dataList, setDataList] = useState<Item[]>([]);
  const [autoUpdate, setAutoUpdate] = useState(false);

  const handleChangeDate = (date: Date) => {
    setDate(date);
    setShowDate(false);
  };

  const { categoryStore, transactionStore, productStore } = useStore();
  const { currentScreen } = useContext(MainContext);

  const getCustomers = useCallback(async () => {
    try {
      // setLoading(true);
      await transactionStore.fetchTransactions(
        // `sales/?date=${formatDate(date)}`
        "incomes/"
      );
      const POSTransactions = transactionStore.transactions.filter(
        (s) => s.category === categoryStore.categoryId("Point of Sales")
      );

      const customerTransaction = POSTransactions.map((s) => {
        const descDetails = s.description.split(", ");

        return {
          id: parseInt(s.pk),
          name: s.transmitter,
          paymentStatus: descDetails[1].toLowerCase() as
            | "paid"
            | "not paid"
            | "validating",
          amountPaid: parseFloat(descDetails[4]) as number,
          discountSales: parseFloat(descDetails[5]) as number,
          amountPaidGCash: parseFloat(descDetails[6]) as number,
          toPrint: descDetails[2] === "Print",
          isClosed: descDetails[3] === "Close",
          dateTransacted: s.datetime_transacted,
        };
      });

      setCustomers((prev) => customerTransaction);

      const particularSalesItems = POSTransactions.map((s) => {
        return s.particular_transaction.map((t) => {
          return { id: s.pk, part: t };
        });
      })
        .flat(1)
        .filter((v) => v.part.description.includes("SKU"))
        .map((u) => {
          return {
            itemId: parseInt(
              u.part.description.split("***")[0].replace("SKU", "")
            ),
            itemDescription: u.part.description.split("***")[1],
            custId: parseInt(u.id),
            qty: u.part.quantity,
            unitAmount: u.part.unit_amount,
            claimed: u.part.remarks.includes("Claimed"),
          };
        });

      const particularLaborItems = POSTransactions.map((s) => {
        return s.particular_transaction.map((t) => {
          return { id: s.pk, part: t };
        });
      })
        .flat(1)
        .filter((v) => v.part.description.includes("Labor"))
        .map((u) => {
          return {
            id: parseInt(u.part.id ?? "-1"),
            custId: parseInt(u.id),
            laborer: u.part.remarks.split(" ")[0],
            description: u.part.description,
            cost: u.part.unit_amount,
            collected: parseInt(u.part.remarks.split(" ")[1]),
          };
        });
      setSalesItems(particularSalesItems);
      setLaborItems(particularLaborItems);
      // setLoading(false);
    } catch (error) {
      // setLoading(false);
      console.error(error);
    }
  }, [date]);

  const getCategories = useCallback(async () => {
    await categoryStore.fetchCategories();
  }, []);

  const getProducts = useCallback(async () => {
    try {
      setLoading(true);
      const resp = await productStore.fetchProducts();
      resp.data?.forEach((s) => {
        if (!dataList.map((s) => `${s.id}`).includes(`${s.pk}`))
          setDataList((prev) => [
            ...prev,
            {
              id: parseInt(s.pk),
              name: s.description,
              price: s.sell_price,
            } as Item,
          ]);
      });
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  }, [dataList]);

  const deleteTransactionHistory = () => {
    transactionStore.deleteTransactionHistory();
  };

  useEffect(() => {
    getCategories();
    // getProducts();
  }, []);

  useEffect(() => {
    if (props.visible && currentScreen === "Sales") {
      deleteTransactionHistory();
      getCustomers();

      // if (true) {
      //   const interval = setInterval(() => {
      //     getCustomers();
      //   }, 10000);
      //   return () => clearInterval(interval);
      // }
    }
  }, [props.visible, currentScreen]);

  return (
    props.visible && (
      <ReviewContext.Provider value={{ items: dataList }}>
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgb(19,79,92)",
            paddingVertical: 10,
            flexDirection: "row",
          }}
        >
          <Text
            style={{ fontSize: 30, color: "white" }}
            onPress={() => setShowDate(true)}
          >
            {date.toDateString()}
          </Text>
          <Icon
            name="edit"
            size={35}
            color="white"
            style={{ margin: 10 }}
            onPress={() => setShowDate(true)}
          />
        </View>
        <ScrollView style={{ backgroundColor: "rgb(208,224,227)" }}>
          <View>
            {customers
              .filter(
                (s) =>
                  formatDate(date) === formatDate(new Date(s.dateTransacted))
              )
              .map((s) => (
                <TouchableOpacity
                  key={`$custView-${s.id}`}
                  onPress={() => {
                    s.id === customer.id
                      ? setCustomer(defaultCustomer)
                      : setCustomer(s);
                  }}
                >
                  <CustomerViewItem
                    customer={s}
                    customerSalesItems={salesItems.filter(
                      (t) => t.custId === s.id
                    )}
                    customerLaborItems={laborItems.filter(
                      (t) => t.custId === s.id
                    )}
                    selected={s.id === customer.id}
                  />
                </TouchableOpacity>
              ))}
          </View>
          {showDate && (
            <DateTimePicker
              mode="date"
              display="calendar"
              value={date}
              maximumDate={new Date()}
              onChange={(_, date) => handleChangeDate(date ?? new Date())}
            />
          )}
        </ScrollView>
      </ReviewContext.Provider>
    )
  );
};

const styles = StyleSheet.create({
  laborItems: {
    backgroundColor: "rgb(208,224,227)",
    marginTop: 60,
  },
});
