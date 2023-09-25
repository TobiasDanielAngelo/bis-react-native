import { observer } from "mobx-react-lite";
import { useState } from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import { MenuBar } from "../../components/sales/bars/MenuBar";
import { POSView } from "./M1POSView";
import { RedeemView } from "./M2RedeemView";
import { RefundView } from "./M3RefundView";
import { ReviewView } from "./M4ReviewView";

export const SalesModule = observer(({ navigation }: any) => {
  const [view, setView] = useState("transact");
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
        <ReviewView
          visible={view === "view"}
          setRefundInputFocus={setRefundInputFocus}
        />
      </View>
      <MenuBar
        view={view}
        setView={setView}
        POSInputFocus={POSInputFocus}
        refundInputFocus={refundInputFocus}
      />
      {/* <Button title="Logout" onPress={logoutUser} /> */}
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
    backgroundColor: "rgb(118,165,175)",
  },
});
