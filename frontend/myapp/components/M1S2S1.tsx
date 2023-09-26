import { useContext } from "react";
import { StyleSheet, Text, View } from "react-native";
import { winWidth } from "../constants/constants";
import { laborDueToMechanic } from "../constants/helpers";
import { M1S2Context } from "../constants/interfaces";

export const StatusBar = (props: any) => {
  const { laborer, laborItems } = useContext(M1S2Context);

  const currentTotalGiven = laborItems
    .filter((s) => s.laborer === laborer)
    .map((s) => s.collected)
    .reduce((a, b) => a + b, 0);
  const currentTotalToGive = laborItems
    .filter((s) => s.laborer === laborer)
    .map((s) =>
      laborDueToMechanic(s.description.split(" ")[1], parseFloat(`${s.cost}`))
    )
    .reduce((a, b) => a + b, 0);

  return (
    <View
      style={{
        backgroundColor: "lightcyan",
        paddingTop: 10,
        display: laborer !== "" ? "flex" : "none",
      }}
    >
      <View style={styles.processBar}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "row",
          }}
        >
          <Text style={styles.totalText}>
            {`\u20b1`}
            {(currentTotalToGive - currentTotalGiven).toFixed(2)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  processBar: {
    backgroundColor: "darkslategray",
    height: 50,
    marginVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  paymentStatusText: {
    fontSize: 18,
    marginRight: 10,
    flex: 1,
    textAlign: "right",
  },
  totalText: {
    color: "white",
    fontSize: winWidth / 12,
    flex: 1,
    marginRight: 20,
    textAlign: "right",
    fontFamily: "monospace",
  },
  printBtn: {
    marginLeft: 20,
    margin: 5,
  },
  payBtn: {
    margin: 5,
  },
});
