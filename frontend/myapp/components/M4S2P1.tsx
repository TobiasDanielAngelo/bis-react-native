import { useState, useContext, useEffect } from "react";
import {
  TouchableOpacity,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { toMoney, totalBillAmt, totalCoinAmt } from "../constants/helpers";
import moment from "moment";
import { M4S2Context } from "../constants/interfaces";
import { defaultBills, defaultCoins } from "../constants/constants";

export const CashCoinReportForm = () => {
  const { mode, setMode, report, bills, setBills, coins, setCoins } =
    useContext(M4S2Context);

  useEffect(() => {
    if (mode === "start") {
      let arr = report.moneyArr.replaceAll("N", "").split(", ");
      setBills({
        b1000: arr[0],
        b500: arr[1],
        b200: arr[2],
        b100: arr[3],
        b50: arr[4],
        b20: arr[5],
      });
      setCoins({
        c20: arr[6],
        c10: arr[7],
        c5: arr[8],
        c1: arr[9],
      });
    } else {
      setBills(defaultBills);
      setCoins(defaultCoins);
    }
  }, [mode, report]);

  return (
    <>
      <View style={{ flexDirection: "row", marginHorizontal: 10 }}>
        <View style={{ flex: 1, alignItems: "flex-end", margin: 10 }}>
          <Text style={styles.titleText}>Bills</Text>
          <View style={styles.main}>
            <Text style={styles.text}>{`\u20b11000 \u00d7`}</Text>
            <TextInput
              style={styles.input}
              value={bills.b1000}
              keyboardType="numeric"
              onChangeText={(amt) => {
                let n = parseFloat(amt.replace(/[^0-9]/g, ""));
                setBills({ ...bills, b1000: isNaN(n) ? "" : n.toString() });
              }}
            />
          </View>
          <View style={styles.main}>
            <Text style={styles.text}>{`\u20b1500 \u00d7`}</Text>
            <TextInput
              style={styles.input}
              value={bills.b500}
              keyboardType="numeric"
              onChangeText={(amt) => {
                let n = parseFloat(amt.replace(/[^0-9]/g, ""));
                setBills({ ...bills, b500: isNaN(n) ? "" : n.toString() });
              }}
            />
          </View>
          <View style={styles.main}>
            <Text style={styles.text}>{`\u20b1200 \u00d7`}</Text>
            <TextInput
              style={styles.input}
              value={bills.b200}
              keyboardType="numeric"
              onChangeText={(amt) => {
                let n = parseFloat(amt.replace(/[^0-9]/g, ""));
                setBills({ ...bills, b200: isNaN(n) ? "" : n.toString() });
              }}
            />
          </View>
          <View style={styles.main}>
            <Text style={styles.text}>{`\u20b1100 \u00d7`}</Text>
            <TextInput
              style={styles.input}
              value={bills.b100}
              keyboardType="numeric"
              onChangeText={(amt) => {
                let n = parseFloat(amt.replace(/[^0-9]/g, ""));
                setBills({ ...bills, b100: isNaN(n) ? "" : n.toString() });
              }}
            />
          </View>
          <View style={styles.main}>
            <Text style={styles.text}>{`\u20b150 \u00d7`}</Text>
            <TextInput
              style={styles.input}
              value={bills.b50}
              keyboardType="numeric"
              onChangeText={(amt) => {
                let n = parseFloat(amt.replace(/[^0-9]/g, ""));
                setBills({ ...bills, b50: isNaN(n) ? "" : n.toString() });
              }}
            />
          </View>
          <View style={styles.main}>
            <Text style={styles.text}>{`\u20b120 \u00d7`}</Text>
            <TextInput
              style={styles.input}
              value={bills.b20}
              keyboardType="numeric"
              onChangeText={(amt) => {
                let n = parseFloat(amt.replace(/[^0-9]/g, ""));
                setBills({ ...bills, b20: isNaN(n) ? "" : n.toString() });
              }}
            />
          </View>
        </View>
        <View style={{ flex: 1, alignItems: "flex-end", margin: 10 }}>
          <Text style={styles.titleText}>Coins</Text>
          <View style={styles.main}>
            <Text style={styles.text}>{`\u20b120 \u00d7`}</Text>
            <TextInput
              style={styles.input}
              value={coins.c20}
              keyboardType="numeric"
              onChangeText={(amt) => {
                let n = parseFloat(amt.replace(/[^0-9]/g, ""));
                setCoins({ ...coins, c20: isNaN(n) ? "" : n.toString() });
              }}
            />
          </View>
          <View style={styles.main}>
            <Text style={styles.text}>{`\u20b110 \u00d7`}</Text>
            <TextInput
              style={styles.input}
              value={coins.c10}
              keyboardType="numeric"
              onChangeText={(amt) => {
                let n = parseFloat(amt.replace(/[^0-9]/g, ""));
                setCoins({ ...coins, c10: isNaN(n) ? "" : n.toString() });
              }}
            />
          </View>
          <View style={styles.main}>
            <Text style={styles.text}>{`\u20b15 \u00d7`}</Text>
            <TextInput
              style={styles.input}
              value={coins.c5}
              keyboardType="numeric"
              onChangeText={(amt) => {
                let n = parseFloat(amt.replace(/[^0-9]/g, ""));
                setCoins({ ...coins, c5: isNaN(n) ? "" : n.toString() });
              }}
            />
          </View>
          <View style={styles.main}>
            <Text style={styles.text}>{`\u20b11 \u00d7`}</Text>
            <TextInput
              style={styles.input}
              value={coins.c1}
              keyboardType="numeric"
              onChangeText={(amt) => {
                let n = parseFloat(amt.replace(/[^0-9]/g, ""));
                setCoins({ ...coins, c1: isNaN(n) ? "" : n.toString() });
              }}
            />
          </View>
          <View
            style={{
              alignSelf: "center",
              marginTop: 10,
              flex: 1,
            }}
          >
            <Text style={styles.total}>Total: (T)</Text>
            <Text style={styles.total}>{`\u20b1${toMoney(
              totalBillAmt(bills) + totalCoinAmt(coins)
            )}`}</Text>
          </View>
        </View>
      </View>
    </>
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
