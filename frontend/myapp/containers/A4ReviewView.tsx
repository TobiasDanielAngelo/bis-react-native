import { observer } from "mobx-react-lite";
import moment from "moment";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { HView } from "../blueprints/HView";
import { MyDatePicker } from "../blueprints/MyDatePicker";
import { MyDropdownPicker } from "../blueprints/MyDropdownPicker";
import { MyOverlay } from "../blueprints/MyOverlay";
import { MyStatusBar } from "../blueprints/MyStatusBar";
import { MyText } from "../blueprints/MyText";
import { totalValue } from "../constants/helpers";
import { SalesLaborReturnList } from "../components/SalesLaborReturnList";
import { addDays, toMoney } from "../constants/helpers";
import { useStore } from "../stores/Store";

export const A4ReviewView = observer((props: { isVisible?: boolean }) => {
  const { isVisible } = props;

  const { saleStore, accountStore, transactionStore } = useStore();

  const [date, setDate] = useState(new Date());
  const [value, setValue] = useState(-1);
  const [isVisible1, setVisible1] = useState(false);

  const sales = saleStore.sales.filter(
    (s) =>
      moment(s.datetime_opened).format("MMDDYY") ===
      moment(date).format("MMDDYY")
  );

  const sale = sales.find((s) => s.id === value);

  const amount =
    totalValue(sale?.sales_item.map((s) => s.selling_price * s.quantity)) +
    totalValue(
      sale?.labor_item.map((s) => s.amount_received - s.amount_returned)
    ) -
    totalValue(sale?.returned_item.map((s) => s.selling_price * s.quantity));

  const accountTransmitter = (t: number) => {
    return accountStore.getItem(transactionStore.getItem(t)?.transmitter)?.name;
  };

  const accountReceiver = (t: number) => {
    let receiver = accountStore.getItem(
      transactionStore.getItem(t)?.receiver
    )?.name;
    return receiver === "STOCKS" ? "" : receiver;
  };

  const amountReceived = (t: number) => {
    return transactionStore.getItem(t)?.amount;
  };

  const amountPaid = totalValue(
    sale?.payment?.map(
      (s) =>
        (accountReceiver(s) === "STOCKS"
          ? -1
          : accountTransmitter(s) === "STOCKS"
          ? 1
          : 0) * (amountReceived(s) ?? 0)
    )
  );

  const totalAmountReturned = totalValue(
    sale?.labor_item?.map((s) => s.amount_returned)
  );

  const totalAmountRefunded = totalValue(
    sale?.returned_item?.map((s) => s.selling_price * s.quantity)
  );

  const totalDiscount = sale?.discount ?? 0;

  const changeAmount = amount
    ? -(
        amount -
        amountPaid -
        totalAmountReturned +
        totalAmountRefunded -
        totalDiscount
      )
    : 0;

  const onPressPrint = () => {
    if (!sale) return;
    saleStore.updateItem(sale.id, {
      is_active: true,
      to_print: !sale.to_print,
    });
  };

  useEffect(() => {
    if (!isVisible) return;
    saleStore.fetchAll({
      startDate: addDays(date, -1).toISOString(),
      endDate: addDays(date, 1).toISOString(),
    });
    setValue(-1);
  }, [date, isVisible]);

  return (
    isVisible && (
      <View style={styles.main}>
        <View style={styles.body}>
          <MyOverlay
            isVisible={isVisible1}
            setVisible={setVisible1}
            title="Payment Details"
          >
            {sale?.payment
              ?.filter((s) => accountReceiver(s) !== "")
              .map((s) => (
                <HView key={s}>
                  <MyText text={accountReceiver(s)} size="medium" />
                  <MyText
                    text={toMoney(amountReceived(s) ?? 0)}
                    size="medium"
                  />
                </HView>
              ))}
            <HView hidden={changeAmount < 0}>
              <MyText text="CHANGE" size="medium" />
              <MyText
                text={toMoney(
                  -changeAmount + totalAmountReturned + totalAmountRefunded
                )}
                size="medium"
              />
            </HView>
            <HView hidden={totalAmountRefunded <= 0}>
              <MyText text="REFUNDED" size="medium" />
              <MyText text={toMoney(-totalAmountRefunded)} size="medium" />
            </HView>
            <HView hidden={totalAmountReturned <= 0}>
              <MyText text="LABORER" size="medium" />
              <MyText text={toMoney(-totalAmountReturned)} size="medium" />
            </HView>
            <HView hidden={sale?.discount === 0}>
              <MyText text="DISCOUNT" size="medium" />
              <MyText text={toMoney(-(sale?.discount ?? 0))} size="medium" />
            </HView>
            <HView>
              <MyText text="TOTAL" size="medium" highlight />
              <MyText
                text={toMoney(
                  totalValue(
                    sale?.payment?.map(
                      (s) =>
                        (accountReceiver(s) === "" ? -1 : 1) *
                        (amountReceived(s) ?? 0)
                    )
                  )
                )}
                size="medium"
                highlight
              />
            </HView>
          </MyOverlay>
          <MyDropdownPicker
            value={value}
            setValue={setValue}
            items={sales.map((s) => ({
              value: s.id,
              label: `#${s.id} - ${moment(s.datetime_opened).format(
                "h:mm A"
              )} ${s.customer_name}`,
            }))}
            label={`${sales.length === 0 ? "No" : sales.length} sale${
              sales.length === 1 ? "" : "s"
            } available.`}
          />
          <SalesLaborReturnList sale={sale} />
        </View>
        <View style={styles.bar}>
          <MyDatePicker
            date={date}
            setDate={setDate}
            range="past"
            size="medium"
            noIcon
          />
        </View>
        <MyStatusBar
          amount={amount}
          action1={
            value !== -1
              ? {
                  name: "print",
                  onPress: onPressPrint,
                  selected: sale?.to_print,
                }
              : undefined
          }
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
    margin: 3,
  },
  bar: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
});
