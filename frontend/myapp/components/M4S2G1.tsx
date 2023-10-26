import { useContext, useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { M4S2Context } from "../constants/interfaces";
import { useStore } from "../stores/Store";
import { CashCoinReportForm } from "./M4S2P1";
import moment from "moment";
import { ModeItem } from "./M4S2U1";
import { defaultBills, defaultCoins } from "../constants/constants";

const modes = ["start", "middle", "end"];

export const ReportSelection = () => {
  const { mode, setMode, report, setBills, setCoins } = useContext(M4S2Context);

  const clearSelection = () => {
    setBills(defaultBills);
    setCoins(defaultCoins);
  };

  return (
    <View>
      <View style={{ flexDirection: "row" }}>
        {mode !== "" && (
          <ModeItem
            title="Clear"
            logo="refresh"
            selected={true}
            onPress={clearSelection}
            isLarge={mode === ""}
          />
        )}
        <ModeItem
          title="Start a Report"
          logo="add"
          selected={mode === modes[0]}
          onPress={() => {
            //   clearSelection();
            setMode(modes[0]);
          }}
          isLarge={mode === ""}
        />
        {report.id !== -1 && (
          <ModeItem
            title="Report"
            logo="update"
            selected={mode === modes[1]}
            onPress={() => {
              //   clearSelection();
              setMode(modes[1]);
            }}
            isLarge={mode === ""}
          />
        )}

        {mode !== "" && (
          <ModeItem
            title="Cancel"
            logo="close"
            selected={true}
            onPress={() => {
              setMode("");
            }}
            isLarge={mode === ""}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  toggleBtn: {
    backgroundColor: "teal",
    marginVertical: 10,
    marginHorizontal: 40,
    borderRadius: 20,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 7,
    elevation: 5,
  },
  shadowProp: {
    shadowColor: "black",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 7,
    elevation: 5,
  },
  descriptionText: {
    fontSize: 15,
    textAlign: "left",
    color: "grey",
    fontFamily: "monospace",
  },
  priceText: { fontSize: 19, textAlign: "right", fontFamily: "monospace" },
  mainItemText: { fontSize: 18, textAlign: "left", fontFamily: "monospace" },
});
