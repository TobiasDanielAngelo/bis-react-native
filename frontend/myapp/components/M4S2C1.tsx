import moment from "moment";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  defaultBills,
  defaultCoins,
  defaultReport,
} from "../constants/constants";
import { M4S2Context } from "../constants/interfaces";
import { useStore } from "../stores/Store";
import { CreateReportMode } from "./M4S2C2";
import { TallyMode } from "./M4S2C3";
import { FinishReportMode } from "./M4S2C4";
import { ReportSelection } from "./M4S2G1";

export const ReportView = (props: { visible: boolean }) => {
  const { accountStore, transactionStore, particularPOSStore, categoryStore } =
    useStore();
  const [mode, setMode] = useState("");
  const [report, setReport] = useState(defaultReport);
  const [bills, setBills] = useState(defaultBills);
  const [coins, setCoins] = useState(defaultCoins);

  const getReportOfDay = async () => {
    transactionStore.deleteTransactionHistory();
    const resp = await transactionStore.fetchOneTransaction(
      `transactions/?todaysreport=1&date=${moment(new Date()).format(
        "YYYYMMDD"
      )}`
    );
    if (resp.data && resp.data.length > 0)
      setReport({
        id: parseInt(resp.data[0].pk ?? "-1"),
        pcvId:
          resp.data[0].particular_transaction.length > 0
            ? parseInt(resp.data[0].particular_transaction[0].id ?? "-1")
            : -1,
        opened: resp.data[0].description.includes("Open"),
        moneyArr:
          resp.data[0].particular_transaction.length > 0
            ? resp.data[0].particular_transaction[0].description ??
              defaultReport.moneyArr
            : defaultReport.moneyArr,
      });
  };

  const getSalesBalance = async () => {};

  const getCategories = async () => {
    await categoryStore.fetchCategories();
  };

  useEffect(() => {
    if (props.visible) {
      getCategories();
      setReport(defaultReport);
      getReportOfDay();
    }
  }, [props.visible]);

  const values = {
    mode: mode,
    setMode: setMode,
    report: report,
    setReport: setReport,
    bills: bills,
    setBills: setBills,
    coins: coins,
    setCoins: setCoins,
  };

  return (
    props.visible && (
      <M4S2Context.Provider value={values}>
        <ReportSelection />
        <View style={{ flex: 1 }}>
          <CreateReportMode visible={mode === "start"} />
          <TallyMode visible={mode === "middle"} />
        </View>

        <View
          style={{
            backgroundColor: "teal",
            marginVertical: 10,
            display: mode !== "" ? "flex" : "none",
          }}
        >
          <Text style={{ textAlign: "center", color: "white", fontSize: 20 }}>
            {moment(new Date()).format("dddd - MMM. D, YYYY")}
          </Text>
        </View>
      </M4S2Context.Provider>
    )
  );
};

const styles = StyleSheet.create({
  descriptionText: {
    fontSize: 15,
    textAlign: "left",
    color: "grey",
    fontFamily: "monospace",
  },
  priceText: { fontSize: 19, textAlign: "right", fontFamily: "monospace" },
  mainItemText: { fontSize: 18, textAlign: "left", fontFamily: "monospace" },
});
