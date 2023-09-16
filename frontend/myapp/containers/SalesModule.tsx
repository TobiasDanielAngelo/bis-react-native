import { StyleSheet, View, SafeAreaView } from "react-native";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { POSView } from "./POSView";
import { RedeemView } from "./RedeemView";
import { RefundView } from "./RefundView";
import { ReviewView } from "./ReviewView";
import { MenuBar } from "../components/SalesComponents/MenuBar";
import { useLocation, useNavigate } from "react-router-native";
import { useRoute } from "@react-navigation/native";

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
