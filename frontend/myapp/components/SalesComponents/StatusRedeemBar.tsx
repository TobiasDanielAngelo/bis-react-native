import { StyleSheet, View, Text } from "react-native";
import { useContext } from "react";
import { RedeemContext } from "../../interfaces/interfaces";
import { winWidth } from "../../constants/Constants";

export const StatusRedeemBar = (props: any) => {
  const { laborer } = useContext(RedeemContext);

  return (
    <View
      style={{
        backgroundColor: "rgb(208,224,227)",
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
          <Text
            style={{
              color: "white",
              fontSize: winWidth / 12,
              flex: 1,
              marginRight: 20,
              textAlign: "right",
              fontFamily: "monospace",
            }}
          >
            {/* {`\u20b1`}
            {props.currentTotalToGive} -{` \u20b1`}
            {props.currentTotalGiven} = */}
            {`\u20b1`}
            {(props.currentTotalToGive - props.currentTotalGiven).toFixed(2)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  processBar: {
    backgroundColor: "rgb(19,79,92)",
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
  printBtn: {
    marginLeft: 20,
    margin: 5,
  },
  payBtn: {
    margin: 5,
  },
});
