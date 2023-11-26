import { observer } from "mobx-react-lite";
import moment from "moment";
import { useEffect, useState } from "react";
import { StyleSheet, View, FlatList } from "react-native";
import { HView } from "../blueprints/HView";
import { MyDotPager } from "../blueprints/MyDotPager";
import { MyDropdownPicker } from "../blueprints/MyDropdownPicker";
import { MyList } from "../blueprints/MyList";
import { MyStatusBar } from "../blueprints/MyStatusBar";
import { totalValue } from "../constants/helpers";
import { PurchaseDeliveredCard } from "../components/PurchaseDeliveredCard";
import { monthYears } from "../constants/constants";
import { getMonthName } from "../constants/helpers";
import { useStore } from "../stores/Store";

export const C5HistoryView = observer((props: { isVisible?: boolean }) => {
  const { isVisible } = props;

  const { purchaseStore } = useStore();

  const [month, setMonth] = useState(202301);
  const [order, setOrder] = useState(-1);
  const [index, setIndex] = useState(0);

  console.log(month);

  const currentOrder = purchaseStore.getItem(order);
  const purchaseItems = currentOrder?.purchase_item;

  const totalAmount = totalValue(
    purchaseItems?.map((s) => Math.round(s.purchase_price * s.quantity))
  );

  const onPressPrint = () => {
    if (order === -1) return;
    purchaseStore.updateItem(order, {
      to_print: !currentOrder?.to_print,
    });
  };

  useEffect(() => {
    setOrder(-1);
    let y = parseInt(month.toString().substring(0, 4));
    let m = parseInt(month.toString().substring(4, 6));
    let startDate = new Date(y, m - 1, 1).toISOString();
    let endDate =
      m === 11
        ? new Date(y + 1, 1, 1).toISOString()
        : new Date(y, m, 2).toISOString();
    purchaseStore.fetchAll({
      startDate: startDate,
      endDate: endDate,
    });
  }, [month]);

  return (
    isVisible && (
      <View style={styles.main}>
        <HView>
          <MyDropdownPicker
            items={monthYears().map((s) => ({
              label: `${getMonthName(
                parseInt(s.toString().substring(4, 6))
              )}-${s.toString().substring(2, 4)}`,
              value: s,
            }))}
            value={month}
            setValue={setMonth}
            label="Select a Month"
            flex
          />
          <MyDropdownPicker
            items={purchaseStore.purchases
              .filter((s) => s.status === "4")
              .filter(
                (s) =>
                  moment(s.datetime_closed).format("YYYYMM") ===
                  month.toString()
              )

              .map((s) => ({
                value: s.id,
                label: s.supplier_name,
              }))}
            value={order}
            setValue={setOrder}
            label="Select an Order"
            flex
          />
        </HView>
        <View style={styles.body}>
          <MyList headNote="Order" hidden={!purchaseItems}>
            <FlatList
              data={
                purchaseItems &&
                purchaseItems.slice(10 * index, 10 * (index + 1))
              }
              renderItem={({ item }) => (
                <PurchaseDeliveredCard item={item} locked />
              )}
              keyboardShouldPersistTaps="always"
            />
          </MyList>
          <MyDotPager
            index={index}
            setIndex={setIndex}
            length={purchaseItems ? Math.ceil(purchaseItems.length / 10) : 0}
            hidden={!purchaseItems || purchaseItems.length <= 10}
          />
        </View>

        <MyStatusBar
          action1={{
            name: "print",
            onPress: onPressPrint,
            selected: currentOrder?.to_print,
          }}
          amount={totalAmount}
          hidden={order === -1}
        />
      </View>
    )
  );
});

const styles = StyleSheet.create({
  main: {
    flex: 1,
  },
  body: {
    flex: 1,
  },
  bar: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
});
