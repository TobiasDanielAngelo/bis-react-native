import { observer } from "mobx-react-lite";
import moment from "moment";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { HView } from "../blueprints/HView";
import { ModesBar } from "../blueprints/ModesBar";
import { MyDropdownPicker } from "../blueprints/MyDropdownPicker";
import { MyLineChart } from "../blueprints/MyLineChart";
import { doNothing, durationDays } from "../constants/constants";
import { addDays, totalValue } from "../constants/helpers";
import { useStore } from "../stores/Store";

const arrayRange = (start: number, stop: number, step: number = 1) =>
  Array.from(
    { length: (stop - start) / step + 1 },
    (_, index) => start + index * step
  );

interface AccountPriceXY {
  account: number;
  price: number;
}

interface PriceTrend {
  date: Date;
  points: AccountPriceXY[];
}

let ms = 86400000;

const actions = [
  { id: 1, name: "arrow-drop-down", label: "5Y", interval: 2 * 75 * ms },
  { id: 2, name: "arrow-drop-down", label: "2Y", interval: 2 * 30.0 * ms },
  { id: 3, name: "arrow-drop-down", label: "1Y", interval: 2 * 15.0 * ms },
  { id: 4, name: "arrow-drop-down", label: "1B", interval: 15 * ms },
  { id: 5, name: "arrow-drop-down", label: "1Q", interval: 8.0 * ms },
  { id: 6, name: "arrow-drop-down", label: "1M", interval: 2.5 * ms },
  { id: 7, name: "arrow-drop-down", label: "1W", interval: 0.6 * ms },
  { id: 8, name: "arrow-drop-down", label: "3D", interval: 0.25 * ms },
  { id: 9, name: "arrow-drop-down", label: "1D", interval: 0.08 * ms },
];

export const D3TimelineView = observer((props: { isVisible?: boolean }) => {
  const { isVisible } = props;
  const { accountStore } = useStore();
  const [value, setValue] = useState(-3);
  const [mode, setMode] = useState(6);
  const [dataPoints, setDataPoints] = useState<PriceTrend[]>([]);

  const dates =
    mode !== 0
      ? arrayRange(
          0,
          -12 * actions[mode - 1].interval,
          -actions[mode - 1].interval
        )
          .map((s) => new Date(new Date().getTime() + s))
          .sort((a, b) => (a.getTime() > b.getTime() ? 1 : -1))
      : [];

  const dataPointsByAccount =
    dataPoints && value > 0
      ? dataPoints
          .sort((a, b) => (a.date.getTime() > b.date.getTime() ? 1 : -1))
          .map((s) => s.points)
          .flat(1)
          .filter((s) => s.account === value)
      : [];

  const dataPointsTotal = dataPoints.map((s) =>
    totalValue(
      s.points
        .filter((u) => ![11, 16, 19].includes(u.account))
        .map((t) => t.price)
    )
  );

  const dataPointsCash = dataPoints.map((s) =>
    totalValue(
      s.points
        .filter((u) => ![11, 14, 16, 19].includes(u.account))
        .map((t) => t.price)
    )
  );
  const line = dataPointsByAccount
    ? {
        labels: dates
          .sort((a, b) => (a.getTime() > b.getTime() ? 1 : -1))
          .map((s) =>
            moment(s).format(
              durationDays.find((s) => s.duration === actions[mode - 1].label)
                ?.format
            )
          ),

        datasets: [
          {
            data:
              value > 0
                ? dataPointsByAccount.map((s) => Math.round(s.price / 1000))
                : value === 0
                ? dataPointsTotal.map((s) => Math.round(s / 1000))
                : dataPointsCash.map((s) => Math.round(s / 1000)),
          },
        ],
      }
    : undefined;

  const getAccounts = async () => {
    let dps = dates.map((s) => ({
      date: s,
      points: [],
    })) as PriceTrend[];
    for (let i = 0; i < dates.length; i++) {
      const resp = await accountStore.fetchAll({
        endDate: dates[i].toISOString(),
      });
      let target = dps.find((s) => s.date === dates[i]);
      if (target && resp.data)
        target.points = resp.data.map((s) => ({
          account: s.id,
          price: (s.received ?? 0) - (s.transmitted ?? 0),
        }));
    }
    setDataPoints(dps);
  };

  useEffect(() => {
    let dps = dates.map((s) => ({
      date: s,
      points: accountStore.accounts.map((t) => ({ account: t.id, price: -1 })),
    }));
    setDataPoints(dps);
    getAccounts();
    // let dps = accountStore.accounts.map((s) => ({
    //   account: s.id,
    //   points: dates.map((t) => ({
    //     date: t,
    //     price: -1,
    //   })),
    // }));
    // setDataPoints(dps);
  }, [mode]);

  return (
    isVisible && (
      <View style={styles.main}>
        <HView>
          <MyDropdownPicker
            items={[
              { value: -1, label: "TOTAL CASH" },
              { value: 0, label: "TOTAL ASSETS (CASH + STOCKS)" },
              ...accountStore.accounts.map((s) => ({
                value: s.id,
                label: s.name,
              })),
            ]}
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
          <MyLineChart data={line} hidden={value < -2 || mode === 0} />
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
