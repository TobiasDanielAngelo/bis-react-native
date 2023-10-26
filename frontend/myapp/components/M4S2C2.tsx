import { useContext, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { toMoney, totalBillAmt } from "../constants/helpers";
import { CashCoinReportForm } from "./M4S2P1";
import { M4S2Context } from "../constants/interfaces";
import { ScrollView } from "react-native-gesture-handler";
import { useStore } from "../stores/Store";
import moment from "moment";

export const CreateReportMode = (props: { visible: boolean }) => {
  const { mode, setMode, report, bills, coins, setReport } =
    useContext(M4S2Context);

  const { accountStore, transactionStore, particularPOSStore, categoryStore } =
    useStore();

  const addPettyCash = async () => {
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

    const resp1 = await transactionStore.addTransaction({
      category: categoryStore.categoryId("Cash Report") ?? "-1",
      description: `Report, Open`,
      transmitter: "DATS",
      receiver: "DATS",
      particular_transaction: [],
    });

    const resp2 = await particularPOSStore.addParticularPOS(
      {
        remarks: "",
        description: moneyArr,
        quantity: 1,
        unit_amount: 0,
      },
      parseInt(resp1.data?.pk ?? "-1")
    );

    setReport({
      id: parseInt(resp1.data?.pk ?? "-1"),
      pcvId: parseInt(resp2.data?.id ?? "-1"),
      opened: true,
      moneyArr: moneyArr,
    });
  };

  const returnPettyBills = async () => {
    let moneyArr = [
      "N",
      "N",
      "N",
      "N",
      "N",
      "N",
      coins.c20,
      coins.c10,
      coins.c5,
      coins.c1,
    ]
      .map((s) => (s === "" ? "N" : s))
      .join(", ");

    await particularPOSStore.updateParticularPOS(report.pcvId.toString(), {
      remarks: "",
      description: moneyArr,
      quantity: 1,
      unit_amount: 0,
    });

    setReport({
      ...report,
      moneyArr: moneyArr,
    });
  };

  return (
    <>
      <View style={{ display: props.visible ? "flex" : "none", flex: 1 }}>
        <ScrollView persistentScrollbar={true}>
          <CashCoinReportForm />
        </ScrollView>
        <View
          style={{
            display: props.visible ? "flex" : "none",
            flexDirection: "row",
          }}
        >
          <TouchableOpacity
            style={[
              styles.toggleBtn,
              { backgroundColor: report.id !== -1 ? "#ddd" : "teal" },
            ]}
            disabled={report.id !== -1}
            onPress={addPettyCash}
          >
            <Text style={{ textAlign: "center", color: "white", fontSize: 20 }}>
              Place
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleBtn,
              {
                backgroundColor: report.id === -1 ? "#ddd" : "teal",
                display: totalBillAmt(bills) > 0 ? "flex" : "none",
              },
            ]}
            disabled={report.id === -1}
            onPress={returnPettyBills}
          >
            <Text style={{ textAlign: "center", color: "white", fontSize: 20 }}>
              Return {`\u20b1`}
              {totalBillAmt(bills)}
            </Text>
          </TouchableOpacity>
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
