import { useCallback, useContext, useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { Icon, Overlay } from "react-native-elements";
import SelectDropdown from "react-native-select-dropdown";
import { defaultLaborItem, labors } from "../constants/constants";
import {
  CustomerLaborItem,
  M1S1Context,
  M3S3Context,
  MechanicInterface,
  OrderItem,
  PurchaseOrder,
  TransactionUpdateInterface,
} from "../constants/interfaces";
import { useStore } from "../stores/Store";
import DateTimePicker from "@react-native-community/datetimepicker";
import { DateSelector } from "./M1S2U2";
import moment from "moment";

export const FinishOrderModal = (props: {}) => {
  const { popup, setPopup, order, setOrders, orderItems } =
    useContext(M3S3Context);
  const { transactionStore, particularPurchaseStore } = useStore();
  const [checkNum, setCheckNum] = useState("0");
  const [showDate, setShowDate] = useState(false);
  const [date, setDate] = useState(new Date());

  const handleChangeDate = (date: Date) => {
    setDate(date);
    setShowDate(false);
  };

  const onUpdateOrderAmountBackend = async () => {
    let certainOrderItems = orderItems.filter(
      (s) => s.orderId === order && s.brandType === ""
    );

    certainOrderItems.forEach((s) => {
      updateOrderPriceBackend(s);
    });
  };

  const updateOrderPriceBackend = async (orderItem: OrderItem) => {
    try {
      await particularPurchaseStore.updateParticularPurchase(
        orderItem.id.toString(),
        {
          unit_amount: orderItem.purchasePrice,
        }
      );
    } catch (error) {
      console.log(error);
    }
  };

  const onUpdateOrderPrint = async (toPrint: boolean) => {
    const descDetails = (
      transactionStore.transactionDetails(`${order}`)?.description ?? ""
    ).split(", ");
    descDetails[2] = toPrint ? "Print" : "Idle";

    setOrders((prev: PurchaseOrder[]) => {
      let targetOrder = prev.find((s) => s.id === order);
      if (targetOrder) targetOrder.toPrint = toPrint;
      return [...prev];
    });

    await transactionStore.updateTransaction(`${order}`, {
      description: descDetails.join(", "),
    } as TransactionUpdateInterface);
  };

  const onUpdateOrderStatus = async (status: "delivered" | "closed") => {
    if (checkNum === "" && status === "closed") return;

    const descDetails = (
      transactionStore.transactionDetails(`${order}`)?.description ?? ""
    ).split(", ");
    descDetails[1] = status.charAt(0).toUpperCase() + status.slice(1);
    descDetails[3] = `C#${checkNum}`;
    descDetails[4] = date.toISOString();

    setOrders((prev: PurchaseOrder[]) => {
      let targetOrder = prev.find((s) => s.id === order);
      if (targetOrder) targetOrder.status = status;
      return [...prev];
    });

    await transactionStore.updateTransaction(`${order}`, {
      description: descDetails.join(", "),
    } as TransactionUpdateInterface);

    if (status === "closed") {
      onUpdateOrderAmountBackend();
      onUpdateOrderPrint(false);
    }
    setPopup("");
  };

  useEffect(() => {
    setCheckNum("");
    setDate(new Date());
  }, [popup]);

  return (
    <>
      <Overlay
        isVisible={popup === "finishOrder"}
        onBackdropPress={() => setPopup("")}
      >
        <View style={styles.msgBox}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Text style={{ fontSize: 16 }}>Finalize Order Details</Text>
            <Icon
              name={"close"}
              size={30}
              color={"gainsboro"}
              onPress={() => setPopup("")}
            />
          </View>

          <View
            style={{
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 15 }}>Check #: </Text>
            <TextInput
              style={{
                padding: 5,
                borderWidth: 1,
                width: 200,
                borderColor: "gainsboro",
                fontSize: 18,
                height: 40,
                textAlign: "center",
              }}
              value={checkNum}
              onChangeText={setCheckNum}
              keyboardType="numeric"
              placeholder="1234567"
            />
          </View>
          <View
            style={{
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text>Set Due Date: </Text>
            {showDate && (
              <DateTimePicker
                mode="date"
                display="calendar"
                value={date}
                minimumDate={new Date()}
                onChange={(_, date) => handleChangeDate(date ?? new Date())}
              />
            )}
            <Text
              style={{
                fontSize: 20,
                color: "blue",
                textDecorationLine: "underline",
              }}
              onPress={() => setShowDate(true)}
            >
              {moment(date).format("ddd. MMM DD, YYYY")}
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row-reverse",
              justifyContent: "space-between",
            }}
          >
            <Icon
              name={"check"}
              size={40}
              color={"gainsboro"}
              onPress={() => {
                onUpdateOrderStatus("closed");
              }}
            />
          </View>
        </View>
      </Overlay>
    </>
  );
};

const styles = StyleSheet.create({
  msgBox: {
    height: 300,
    width: 300,
    justifyContent: "space-between",
  },
});
