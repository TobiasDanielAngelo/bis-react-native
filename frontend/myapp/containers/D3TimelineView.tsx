import { observer } from "mobx-react-lite";
import moment from "moment";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { HView } from "../blueprints/HView";
import { ModesBar } from "../blueprints/ModesBar";
import { MyDropdownPicker } from "../blueprints/MyDropdownPicker";
import { MyLineChart } from "../blueprints/MyLineChart";
import { doNothing, durationDays } from "../constants/constants";
import { addDays } from "../constants/helpers";
import { useStore } from "../stores/Store";

const arrayRange = (start: number, stop: number, step: number = 1) =>
  Array.from(
    { length: (stop - start) / step + 1 },
    (_, index) => start + index * step
  );

interface DatePriceLoading {
  account: number;
  date: Date;
  price: number;
  loading: boolean;
}

export const D3TimelineView = observer((props: { isVisible?: boolean }) => {
  const { isVisible } = props;
  const { accountStore } = useStore();
  const [showOrders, setShowOrders] = useState(false);
  const [value, setValue] = useState(-1);
  const [mode, setMode] = useState(0);
  const [dataPoints, setDataPoints] = useState<DatePriceLoading[]>([]);

  const actions = [
    { id: 1, name: "arrow-drop-down", label: "5Y", interval: 75 },
    { id: 2, name: "arrow-drop-down", label: "2Y", interval: 30.0 },
    { id: 3, name: "arrow-drop-down", label: "1Y", interval: 15.0 },
    { id: 4, name: "arrow-drop-down", label: "1B", interval: 7.5 },
    { id: 5, name: "arrow-drop-down", label: "1Q", interval: 4.0 },
    { id: 6, name: "arrow-drop-down", label: "1M", interval: 1.3 },
    { id: 7, name: "arrow-drop-down", label: "1W", interval: 0.3 },
  ];

  const dates =
    mode !== 0
      ? arrayRange(
          0,
          -24 * actions[mode - 1].interval,
          -actions[mode - 1].interval
        )
          .map((s) => addDays(new Date(), s + 1))
          .sort((a, b) => (a.getTime() > b.getTime() ? 1 : -1))
      : [];

  const line = {
    labels: dataPoints
      .filter((s) => s.account === value)
      .sort((a, b) => (a.date.getTime() > b.date.getTime() ? 1 : -1))
      .map((s) =>
        moment(s.date).format(
          durationDays.find((s) => s.duration === actions[mode - 1].label)
            ?.format
        )
      ),
    datasets: [
      {
        data: dataPoints
          .filter((s) => s.account === value)
          .sort((a, b) => (a.date.getTime() > b.date.getTime() ? 1 : -1))
          .map((s) => s.price),
      },
    ],
  };

  const getAccounts = async () => {
    let dps = [] as DatePriceLoading[];
    for (let i = 0; i < dates.length; i++) {
      const resp = await accountStore.fetchAccounts({
        endDate: dates[i].toISOString(),
      });
      resp.data?.forEach((s) =>
        dps.push({
          account: s.id,
          price: (s.received ?? 0) - (s.transmitted ?? 0) ?? 0,
          date: dates[i],
          loading: false,
        })
      );
    }
    setDataPoints(dps);
  };

  useEffect(() => {
    getAccounts();
    let dp = accountStore.accounts
      .map((s) =>
        dates.map((t) => ({
          account: s.id,
          date: t,
          price: -1,
          loading: true,
        }))
      )
      .flat(1);

    setDataPoints(dp);
    console.log(dp);
  }, [mode]);

  return (
    isVisible && (
      <View style={styles.main}>
        <HView>
          <MyDropdownPicker
            items={accountStore.accounts.map((s) => ({
              value: s.id,
              label: s.name,
            }))}
            value={value}
            setValue={setValue}
            flex
            label="Select Account"
          />
        </HView>
        <ModesBar
          actions={actions}
          mode={mode}
          setMode={setMode}
          onPressClear={doNothing}
          noSideBtns
        />
        <View style={styles.body}>
          <MyLineChart data={line} hidden={value === -1 || mode === 0} />
          {/* <MyList
            items={[{ id: 1 }, { id: 2 }]}
            headNote="Products"
            flex={2}
            hidden={showOrders}
          />
          <MyList
            items={[{ id: 1 }, { id: 2 }]}
            headNote="Order"
            flex={2}
            hidden={!showOrders}
          /> */}
        </View>
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
