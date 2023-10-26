import { useContext, useState, useEffect } from "react";
import { View } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { Icon } from "react-native-elements";
import {
  CountSession,
  M3S4Context,
  M3S5Context,
  MainContext,
} from "../constants/interfaces";
import { useStore } from "../stores/Store";
import { err } from "react-native-svg/lib/typescript/xml";
import {
  defaultProductQuantified,
  defaultSession,
  monthYears,
} from "../constants/constants";
import { getMonthName } from "../constants/helpers";

export const HistoryBar = () => {
  const { date, setDate, transactions, setTransaction, transaction } =
    useContext(M3S5Context);
  const [open, setOpen] = useState(false);
  const [histOpen, setHistOpen] = useState(false);

  return (
    <View
      style={{
        flexDirection: "row",
        marginHorizontal: 10,
        marginVertical: 20,
      }}
    >
      <View style={{ flex: 4, marginHorizontal: 2 }}>
        <DropDownPicker
          items={monthYears().map((s) => ({
            label: `${getMonthName(parseInt(s.toString().substring(4, 6)))}-${s
              .toString()
              .substring(2, 4)}`,
            value: s,
            icon: () => <></>,
          }))}
          multiple={false}
          setValue={setDate}
          value={date}
          open={open}
          setOpen={setOpen}
          textStyle={{
            fontSize: 15,
            textAlign: "left",
            fontFamily: "monospace",
          }}
          style={{
            height: 35,
            borderColor: "#ddd",
            borderRadius: 0,
            flex: 1,
            minHeight: 35,
          }}
          listMode="MODAL"
          placeholder="See Orders in Progress..."
          placeholderStyle={{ color: "gray" }}
          // disabled={viewProducts}
        />
      </View>
      <View style={{ flex: 6, marginHorizontal: 5 }}>
        <DropDownPicker
          items={transactions.map((s) => ({
            label: `${s.type === "count" ? "INV CHECK #" : "PO"} ${s.id} ${
              s.type !== "count" ? s.receiver : ""
            }`,
            value: s.id,
            icon: () => <></>,
          }))}
          multiple={false}
          setValue={setTransaction}
          value={transaction}
          open={histOpen}
          setOpen={setHistOpen}
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
          placeholder="View History"
          placeholderStyle={{ color: "gray" }}
          listMode="MODAL"
          // disabled={viewProducts}
        />
      </View>
    </View>
  );
};
