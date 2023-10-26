import moment from "moment";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Switch, Text, View } from "react-native";
import { LineChart } from "react-native-chart-kit";
import DropDownPicker from "react-native-dropdown-picker";
import { Icon } from "react-native-elements";
import {
  defaultDatePrice,
  durationDays,
  winWidth,
} from "../constants/constants";
import { getDates } from "../constants/helpers";
import {
  AccountInterface,
  DatePrice,
  DatePriceLoading,
  M4S3Context,
} from "../constants/interfaces";
import { useStore } from "../stores/Store";

export const TimelineView = (props: { visible: boolean }) => {
  const { accountStore, transactionStore, particularPOSStore, categoryStore } =
    useStore();

  const [dataPoints, setDataPoints] = useState<DatePriceLoading[]>([]);
  const [isDetailed, setIsDetailed] = useState(false);
  const [open, setOpen] = useState(false);
  const [duration, setDuration] = useState<
    "5Y" | "2Y" | "1Y" | "1B" | "1Q" | "1M" | "1W" | "3D"
  >("5Y");
  const [account, setAccount] = useState("-1");
  const [accounts, setAccounts] = useState<AccountInterface[]>([]);
  const [dataPoint, setDataPoint] = useState<DatePrice>(defaultDatePrice);

  const getAccounts = async () => {
    const resp = await accountStore.fetchAccounts();

    setAccounts(resp.data ?? []);
  };

  const getTotalStocksWorthBeforeDate = async (date: Date) => {
    const resp = await particularPOSStore.fetchTotalWorthOfProducts(date);
    setDataPoints((prev) => {
      let targetDataPoint = prev.find((s) => s.date === date);
      if (targetDataPoint) {
        targetDataPoint.price = resp.data?.total ?? 0;
        targetDataPoint.loading = false;
        return [...prev];
      }
      return prev;
    });
  };

  const getTotalWorthBeforeDate = async (date: Date) => {
    const resp1 = await particularPOSStore.fetchTotalWorthOfProducts(date);
    const resp2 = await particularPOSStore.fetchAccountBalance("allcash", date);

    setDataPoints((prev) => {
      let targetDataPoint = prev.find((s) => s.date === date);
      if (targetDataPoint) {
        targetDataPoint.price =
          (resp1.data?.total ?? 0) + (resp2.data?.total ?? 0);
        targetDataPoint.loading = false;
        return [...prev];
      }
      return prev;
    });
  };

  const getAccountWorthBeforeDate = async (date: Date) => {
    const resp = await particularPOSStore.fetchAccountBalance(account, date);
    setDataPoints((prev) => {
      let targetDataPoint = prev.find((s) => s.date === date);
      if (targetDataPoint) {
        targetDataPoint.price = resp.data?.total ?? 0;
        targetDataPoint.loading = false;
        return [...prev];
      }
      return prev;
    });
  };

  const getTotalAll = async (dates: Date[]) => {
    dates.forEach((s) => getTotalWorthBeforeDate(s));
  };

  const getTotalStocks = async (dates: Date[]) => {
    dates.forEach((s) => getTotalStocksWorthBeforeDate(s));
  };

  const getAccountFlow = async (dates: Date[]) => {
    dates.forEach((s) => getAccountWorthBeforeDate(s));
  };

  const line = {
    labels: dataPoints.map((s) =>
      moment(s.date).format(
        durationDays.find((s) => s.duration === duration)?.format
      )
    ),
    datasets: [
      {
        data: dataPoints.map((s) => s.price),
      },
    ],
  };

  useEffect(() => {
    setAccount("-1");
    getAccounts();
  }, [props.visible]);

  useEffect(() => {
    if (props.visible) {
      const dates = getDates(duration, isDetailed ? 14 : 7);
      setDataPoints(
        dates.map((s) => ({
          date: s,
          price: -1,
          loading: true,
        }))
      );
      setDataPoint(defaultDatePrice);
      if (account === "0") getTotalStocks(dates);
      else if (account === "total") getTotalAll(dates);
      else if (account !== "-1") getAccountFlow(dates);
    }
  }, [props.visible, isDetailed, account, duration]);

  const values = {};

  return (
    props.visible && (
      <M4S3Context.Provider value={values}>
        <View style={{ flex: 1 }}>
          {!dataPoints ||
            (dataPoints.length === 0 ? (
              <></>
            ) : (
              <>
                <LineChart
                  data={line}
                  width={winWidth}
                  height={400}
                  yAxisLabel={`\u20b1`}
                  chartConfig={{
                    backgroundColor: "#dddddd",
                    backgroundGradientFrom: "teal",
                    backgroundGradientTo: "gray",
                    decimalPlaces: 2, // optional, defaults to 2dp
                    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                    style: {
                      borderRadius: 16,
                    },
                  }}
                  // bezier
                  style={{
                    margin: 10,
                    borderRadius: 16,
                  }}
                  xLabelsOffset={20}
                  verticalLabelRotation={270}
                  onDataPointClick={(data) =>
                    setDataPoint({
                      date: getDates(duration, isDetailed ? 14 : 7)[data.index],
                      price: data.value,
                    })
                  }
                  bezier
                />
              </>
            ))}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginHorizontal: 30,
              marginVertical: 10,
              display: dataPoints
                .map((s) => s.loading)
                .reduce((a, b) => a || b, false)
                ? "none"
                : "flex",
            }}
          >
            {durationDays.map((s) => (
              <Pressable
                key={s.duration}
                onPress={() => setDuration(s.duration)}
              >
                <Text
                  style={{ color: s.duration === duration ? "teal" : "black" }}
                >
                  {s.duration}
                </Text>
              </Pressable>
            ))}
          </View>
          <View
            style={{
              display:
                dataPoints
                  .map((s) => s.loading)
                  .reduce((a, b) => a || b, false) && account !== "-1"
                  ? "flex"
                  : "none",
            }}
          >
            <ActivityIndicator size="large" />
          </View>

          <View
            style={{
              flexDirection: "row",
              display:
                dataPoints
                  .map((s) => s.loading)
                  .reduce((a, b) => a || b, false) && account !== "-1"
                  ? "none"
                  : "flex",
            }}
          >
            <View style={{ marginLeft: 20, flex: 1 }}>
              <Text>Account</Text>
              <DropDownPicker
                items={[
                  ...accounts
                    .filter(
                      (s) =>
                        !s.name.includes("REGISTER") &&
                        !s.name.includes("UNTRACKED")
                    )
                    .map((s) => ({
                      label: s.name,
                      value: s.id ?? "-1",
                      icon:
                        s.name === "UNTRACKED"
                          ? () => <Icon name="disabled-by-default" />
                          : s.name.split(" ")[0] === "CASH"
                          ? () => <Icon name="payments" />
                          : s.name.split(" ")[0] === "COIN"
                          ? () => <Icon name="monetization-on" />
                          : () => <Icon name="account-balance" />,
                    })),
                  {
                    label: "STOCKS",
                    value: "0",
                    icon: () => <Icon name="inventory" />,
                  },
                  {
                    label: "ALL CASH",
                    value: "allcash",
                    icon: () => <Icon name="payments" />,
                  },
                  {
                    label: "TOTAL",
                    value: "total",
                    icon: () => <Icon name="payments" />,
                  },
                ]}
                multiple={false}
                setValue={setAccount}
                value={account}
                open={open}
                setOpen={setOpen}
                textStyle={{
                  fontSize: 15,
                }}
                style={{
                  height: 35,
                  borderColor: "#ddd",
                  borderRadius: 0,
                  flex: 1,
                  minHeight: 35,
                }}
                placeholder="See all Accounts"
                placeholderStyle={{ color: "gray" }}
                dropDownDirection="TOP"
                listMode="MODAL"
              />
            </View>
            <View style={{ paddingHorizontal: 10 }}>
              <Switch
                trackColor={{ false: "gray", true: "teal" }}
                onValueChange={setIsDetailed}
                value={isDetailed}
              />
              <Text style={{ textAlign: "center" }}>
                {isDetailed ? "FAST" : "FINE"}
              </Text>
            </View>
          </View>
          <View
            style={{
              alignItems: "center",
              backgroundColor: "teal",
              display:
                dataPoint.price === -1 || account === "-1" ? "none" : "flex",
            }}
          >
            <Text style={{ fontSize: 20, color: "white" }}>
              At {moment(dataPoint.date).format("MMM. D, YYYY hA")}:
              {dataPoint.price >= 0
                ? ` \u20b1${dataPoint.price.toFixed(2)}`
                : ` (\u20b1${(-dataPoint.price).toFixed(2)})`}
            </Text>
          </View>
        </View>
      </M4S3Context.Provider>
    )
  );
};
