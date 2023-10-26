import { useContext, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { toMoney, totalBillAmt, totalCoinAmt } from "../constants/helpers";
import { CashCoinReportForm } from "./M4S2P1";
import { M4S2Context } from "../constants/interfaces";
import { useStore } from "../stores/Store";
import {
  defaultBills,
  defaultCoins,
  defaultReport,
} from "../constants/constants";
import moment from "moment";

export const TallyMode = (props: { visible: boolean }) => {
  const { mode, setMode, report, bills, coins, setReport, setBills, setCoins } =
    useContext(M4S2Context);

  const { accountStore, transactionStore, particularPOSStore, categoryStore } =
    useStore();

  const addCashReport = async () => {
    let moneyArr = [
      bills.b1000,
      bills.b500,
      bills.b200,
      bills.b100,
      bills.b50,
      bills.b20,
      coins.c20,
      coins.c10,
      coins.c5,
      coins.c1,
    ]
      .map((s) => (s === "" ? "N" : s))
      .join(", ");

    await particularPOSStore.addParticularPOS(
      {
        remarks: "",
        description: moneyArr,
        quantity: 1,
        unit_amount: 0,
      },
      report.id
    );

    setBills(defaultBills);
    setCoins(defaultCoins);
  };

  const closeCashReport = async () => {
    await addCashReport();
    await transactionStore.updateTransaction(report.id.toString(), {
      description: `Report, Closed`,
    });
    setReport({ ...report, opened: false });
    setMode("");
  };

  return (
    <View style={{ display: props.visible ? "flex" : "none", flex: 1 }}>
      <ScrollView>
        <CashCoinReportForm />
      </ScrollView>
      <ScrollView
        style={{
          margin: 10,
          display:
            totalBillAmt(bills) + totalCoinAmt(coins) > 0 ? "flex" : "none",
        }}
        keyboardShouldPersistTaps="always"
      >
        <Text style={{ textAlign: "center", fontSize: 17, color: "darkred" }}>
          Record shows that this cash/coin breakdown is above/below{" "}
          {`\u20b10.00`} of the recorded sales. Accept?
        </Text>
        <View
          style={{
            flexDirection: "row",
            display:
              totalBillAmt(bills) + totalCoinAmt(coins) > 0 ? "flex" : "none",
          }}
        >
          <TouchableOpacity style={styles.toggleBtn} onPress={addCashReport}>
            <Text style={{ textAlign: "center", color: "white", fontSize: 20 }}>
              {`\u2713 Accept`}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, { backgroundColor: "darkred" }]}
          >
            <Text
              style={{ textAlign: "center", color: "white", fontSize: 20 }}
              onPress={() => {
                setBills(defaultBills);
                setCoins(defaultCoins);
              }}
            >
              {`\u00d7 Decline`}
            </Text>
          </TouchableOpacity>
        </View>
        <View
          style={{
            display:
              totalBillAmt(bills) + totalCoinAmt(coins) > 0 ? "flex" : "none",
          }}
        >
          <TouchableOpacity
            style={[
              styles.toggleBtn,
              {
                backgroundColor: "darkgoldenrod",
              },
            ]}
            onPress={closeCashReport}
          >
            <Text style={{ textAlign: "center", color: "white", fontSize: 20 }}>
              Accept and Close Report
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  main: { flexDirection: "row", marginVertical: 5 },
  toggleBtn: {
    backgroundColor: "teal",
    marginVertical: 10,
    marginHorizontal: 10,
    borderRadius: 20,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 7,
    elevation: 5,
    flex: 1,
  },
  shadowProp: {
    shadowColor: "black",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 7,
    elevation: 5,
  },
  text: {
    padding: 5,
    fontSize: 17,
    height: 40,
    textAlign: "right",
  },
  titleText: {
    alignSelf: "flex-start",
    fontSize: 17,
    fontWeight: "bold",
  },
  input: {
    padding: 5,
    borderWidth: 1,
    width: 70,
    borderColor: "gainsboro",
    fontSize: 17,
    height: 40,
    textAlign: "center",
    backgroundColor: "white",
  },
  total: {
    fontSize: 20,
    textAlign: "center",
  },
});
