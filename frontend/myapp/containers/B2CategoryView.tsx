import { observer } from "mobx-react-lite";
import moment from "moment";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { HView } from "../blueprints/HView";
import { MyDatePicker } from "../blueprints/MyDatePicker";
import { MyDotPager } from "../blueprints/MyDotPager";
import { MyDropdownPicker } from "../blueprints/MyDropdownPicker";
import { MyIcon } from "../blueprints/MyIcon";
import { MyList } from "../blueprints/MyList";
import { ExpenseCard } from "../components/ExpenseCard";
import { PayableCard } from "../components/PayableCard";
import { ReceivableCard } from "../components/ReceivableCard";
import { addDays } from "../constants/helpers";
import { payableStore } from "../stores/PayableStore";
import { receivableStore } from "../stores/ReceivableStore";
import { useStore } from "../stores/Store";

export const B2CategoryView = observer((props: { isVisible?: boolean }) => {
  const { isVisible } = props;

  const { categoryStore, transactionStore } = useStore();
  const [category, setCategory] = useState(-1);
  const [date, setDate] = useState(new Date());
  const [index, setIndex] = useState(0);

  const categories = categoryStore.categories
    .filter((s) => s.nature !== "3")
    .filter((s) => s.id !== 1);

  const catDetails = categoryStore.getItem(category);

  const transactions = transactionStore.transactions.filter(
    (s) =>
      s.category === category &&
      moment(s.datetime_transacted).format("MMDDYY") ===
        moment(date).format("MMDDYY")
  );

  const payables = payableStore.payables;

  const receivables = receivableStore.receivables;

  useEffect(() => {
    if (category === -1) return;
    if (category !== 50 && category !== 51) {
      transactionStore.fetchAll({
        startDate: addDays(date, -1).toISOString(),
        endDate: addDays(date, 1).toISOString(),
        category: category,
      });
    } else if (category === 50) {
      payableStore.fetchAll({
        startDate: addDays(date, -60).toISOString(),
        endDate: addDays(date, 60).toISOString(),
      });
    }
  }, [category, date]);

  return (
    isVisible && (
      <View style={styles.main}>
        <MyDropdownPicker
          items={categories.map((s) => ({
            value: s.id,
            label: s.title,
            icon: () => <MyIcon name={s.logo} noLabel />,
          }))}
          value={category}
          setValue={setCategory}
          label="Select a Category"
        />
        <MyDotPager
          length={Math.ceil(transactions.length / 10)}
          index={index}
          setIndex={setIndex}
          hidden={transactions.length < 10}
        />
        <View style={styles.body}>
          <MyList
            headNote={"Transactions"}
            hidden={category === -1 || category === 50 || category === 51}
          >
            <FlatList
              data={transactions.slice(10 * index, 10 * (index + 1))}
              renderItem={({ item }) => (
                <ExpenseCard
                  item={item}
                  negative={
                    catDetails?.nature === "1" ||
                    catDetails?.nature === "4" ||
                    catDetails?.nature === "5"
                  }
                />
              )}
            />
          </MyList>
          <MyList headNote="Payables" hidden={category !== 50}>
            <FlatList
              data={payables.slice(10 * index, 10 * (index + 1))}
              renderItem={({ item }) => <PayableCard item={item} />}
            />
          </MyList>
          <MyList headNote="Receivables" hidden={category !== 51}>
            <FlatList
              data={receivables.slice(10 * index, 10 * (index + 1))}
              renderItem={({ item }) => <ReceivableCard item={item} />}
            />
          </MyList>
        </View>
        <HView>
          <View style={styles.body}></View>
          <MyIcon
            name="navigate-before"
            size="medium"
            noLabel
            onPress={() => setDate((prev) => addDays(prev, -1))}
          />
          <MyDatePicker
            date={date}
            setDate={setDate}
            size="medium"
            range={category !== 50 && category !== 51 ? "past" : undefined}
          />
          <MyIcon
            name="navigate-next"
            size="medium"
            noLabel
            onPress={() => setDate((prev) => addDays(prev, 1))}
          />
        </HView>
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
