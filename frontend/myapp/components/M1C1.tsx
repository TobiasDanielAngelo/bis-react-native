import { observer } from "mobx-react-lite";
import { useState } from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import { MenuBar } from "./M1G1";
import { POSView } from "./M1S1C1";
import { RedeemView } from "./M1S2C1";
import { RefundView } from "./M1S3C1";
import { ReviewView } from "./M1S4C1";

export const SalesModule = observer(({ navigation }: any) => {
  const [view, setView] = useState("compensate");
  const [POSInputFocus, setPOSInputFocus] = useState(false);
  const [refundInputFocus, setRefundInputFocus] = useState(false);

  return (
    <SafeAreaView style={styles.all}>
      <View style={styles.body}>
        <POSView
          visible={view === "transact"}
          setPOSInputFocus={setPOSInputFocus}
        />
        <RedeemView visible={view === "compensate"} />
        <RefundView
          visible={view === "return"}
          setRefundInputFocus={setRefundInputFocus}
        />
        <ReviewView visible={view === "view"} />
      </View>
      <MenuBar
        view={view}
        setView={setView}
        POSInputFocus={POSInputFocus}
        refundInputFocus={refundInputFocus}
      />
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  all: {
    flex: 1,
  },
  body: {
    flex: 1,
    justifyContent: "flex-end",
    paddingTop: 25,
    backgroundColor: "cadetblue",
  },
});
