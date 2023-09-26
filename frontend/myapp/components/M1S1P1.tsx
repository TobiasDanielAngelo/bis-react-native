import { useCallback, useContext, useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { Icon, Overlay } from "react-native-elements";
import { defaultCustomer } from "../constants/constants";
import { randomNameGen } from "../constants/helpers";
import {
  Customer,
  M1S1Context,
  TransactionUpdateInterface,
} from "../constants/interfaces";
import { useStore } from "../stores/Store";

export const CustomerModal = (props: {}) => {
  const { popup, setPopup, customer, customers, setCustomer, setCustomers } =
    useContext(M1S1Context);
  const [name, setName] = useState("");
  const { categoryStore, transactionStore } = useStore();

  useEffect(() => {
    setName("");
  }, [popup]);

  const isCustomerIncluded = customers.map((s) => s.id).includes(customer.id);

  const onUpdateCustomer = useCallback(
    async (name: string) => {
      await transactionStore.updateTransaction(`${customer.id}`, {
        transmitter: name,
      } as TransactionUpdateInterface);

      setCustomer({ ...customer, name: name });

      setCustomers((prev: Customer[]) => {
        (prev.find((s) => s.id === customer.id) ?? defaultCustomer).name = name;
        return [...prev];
      });
    },
    [customers, customer]
  );

  const onCreateCustomer = useCallback(
    async (name: string) => {
      const resp = await transactionStore.addTransaction({
        category: categoryStore.categoryId("Point of Sales") ?? "-1",
        description: "POS #, Not Paid, Idle, Open, 0, 0, 0",
        transmitter: name,
        receiver: "DATS",
        particular_transaction: [],
      });

      setCustomer({
        id: parseInt(resp.data?.pk ?? "-1"),
        name: name,
        paymentStatus: "not paid",
        amountPaid: 0,
        amountPaidGCash: 0,
        discountSales: 0,
        toPrint: false,
        isClosed: false,
        dateTransacted: resp.data?.datetime_transacted ?? "",
      });

      setCustomers((prev: Customer[]) => [
        ...prev,
        {
          id: parseInt(resp.data?.pk ?? "-1"),
          name: name,
          paymentStatus: "not paid",
          amountPaid: 0,
          amountPaidGCash: 0,
          discountSales: 0,
          toPrint: false,
          isClosed: false,
          dateTransacted: "",
        },
      ]);
    },
    [customers]
  );

  return (
    <>
      <Overlay
        isVisible={popup === "name"}
        onBackdropPress={() => setPopup("")}
      >
        <View style={styles.msgBox}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Text style={{ fontSize: 16 }}>
              {!isCustomerIncluded ? "Add New Customer" : "Edit Customer"}
            </Text>
            <Icon
              name={"close"}
              size={30}
              color={"gainsboro"}
              onPress={() => setPopup("")}
            />
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingRight: 20,
            }}
          >
            <Text style={{ fontSize: 20, color: "grey" }}>Name</Text>
            <TextInput
              style={{
                marginTop: -5,
                padding: 5,
                borderWidth: 1,
                width: 200,
                borderColor: "gainsboro",
                fontSize: 15,
                height: 40,
              }}
              value={name}
              onChangeText={setName}
            />
            <Icon
              name={"shuffle"}
              size={30}
              color={"gainsboro"}
              onPress={() => setName(randomNameGen())}
            />
          </View>

          <View style={{ flexDirection: "row-reverse" }}>
            <Icon
              name={"check"}
              size={40}
              color={"gainsboro"}
              onPress={
                !isCustomerIncluded
                  ? () => {
                      onCreateCustomer(name);
                      setPopup("");
                    }
                  : () => {
                      onUpdateCustomer(name);
                      setPopup("");
                    }
              }
            />
          </View>
        </View>
      </Overlay>
    </>
  );
};

const styles = StyleSheet.create({
  msgBox: {
    height: 200,
    width: 300,
    justifyContent: "space-between",
  },
});
