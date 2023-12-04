import { observer } from "mobx-react-lite";
import moment from "moment";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { HView } from "../blueprints/HView";
import { MyDotPager } from "../blueprints/MyDotPager";
import { MyDropdownPicker } from "../blueprints/MyDropdownPicker";
import { MyStatusBar } from "../blueprints/MyStatusBar";
import { TransactionCard } from "../components/TransactionCard";
import { monthYears } from "../constants/constants";
import { getMonthName } from "../constants/helpers";
import { useStore } from "../stores/Store";

export const D4AccountsView = observer((props: { isVisible?: boolean }) => {
  const { isVisible } = props;
  const { transactionStore, accountStore } = useStore();

  const [account, setAccount] = useState(-1);
  const [index, setIndex] = useState(0);
  const [month, setMonth] = useState(202301);

  const transactionByAccount = transactionStore.transactions
    .filter(
      (s) => moment(s.datetime_transacted).format("YYYYMM") === month.toString()
    )
    .filter((s) => s.transmitter === account || s.receiver === account);
  useEffect(() => {
    let y = parseInt(month.toString().substring(0, 4));
    let m = parseInt(month.toString().substring(4, 6));
    let startDate = new Date(y, m - 1, 1).toISOString();
    let endDate =
      m === 11
        ? new Date(y + 1, 1, 1).toISOString()
        : new Date(y, m, 2).toISOString();
    transactionStore.fetchAll({
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
            items={accountStore.accounts.map((s) => ({
              value: s.id,
              label: s.name,
            }))}
            value={account}
            setValue={setAccount}
            label="Select Account"
            flex
          />
        </HView>
        <View style={styles.body}>
          <FlatList
            data={transactionByAccount.slice(10 * index, 10 * (index + 1))}
            renderItem={({ item }) => (
              <TransactionCard
                item={item}
                negative={account === item.transmitter}
                noActions
              />
            )}
          />
        </View>
        <MyDotPager
          length={Math.ceil(transactionByAccount.length / 10)}
          index={index}
          setIndex={setIndex}
          hidden={account === -1 || transactionByAccount.length <= 10}
        />
        <MyStatusBar />
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
