import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { HView } from "../blueprints/HView";
import { ModesBar } from "../blueprints/ModesBar";
import { MyForm } from "../blueprints/MyForm";
import { MyOverlay } from "../blueprints/MyOverlay";
import { MyStatusBar } from "../blueprints/MyStatusBar";
import { MyText } from "../blueprints/MyText";
import { MyTextInput } from "../blueprints/MyTextInput";
import { toNumString } from "../constants/helpers";
import { defaultBills, defaultCoins } from "../constants/constants";
import { toMoney, totalBillAmt, totalCoinAmt } from "../constants/helpers";
import { accountStore } from "../stores/AccountStore";
import { useStore } from "../stores/Store";

export const A5BalanceView = observer((props: { isVisible?: boolean }) => {
  const { isVisible } = props;

  const { transactionStore } = useStore();

  const [isVisible1, setVisible1] = useState(false);
  const [isVisible2, setVisible2] = useState(false);
  const [isVisible3, setVisible3] = useState(false);
  const [mode, setMode] = useState(0);
  const [bills, setBills] = useState(defaultBills);
  const [coins, setCoins] = useState(defaultCoins);

  const expectedCash =
    (accountStore.getItem(10)?.received ?? 0) -
    (accountStore.getItem(10)?.transmitted ?? 0);

  const actualCash = totalBillAmt(bills) + totalCoinAmt(coins);

  const onChangeB1000 = (t: string) => {
    setBills({ ...bills, b1000: toNumString(t) });
  };

  const onChangeB500 = (t: string) => {
    setBills({ ...bills, b500: toNumString(t) });
  };

  const onChangeB200 = (t: string) => {
    setBills({ ...bills, b200: toNumString(t) });
  };

  const onChangeB100 = (t: string) => {
    setBills({ ...bills, b100: toNumString(t) });
  };

  const onChangeB50 = (t: string) => {
    setBills({ ...bills, b50: toNumString(t) });
  };

  const onChangeB20 = (t: string) => {
    setBills({ ...bills, b20: toNumString(t) });
  };

  const onChangeC20 = (t: string) => {
    setCoins({ ...coins, c20: toNumString(t) });
  };

  const onChangeC10 = (t: string) => {
    setCoins({ ...coins, c10: toNumString(t) });
  };

  const onChangeC5 = (t: string) => {
    setCoins({ ...coins, c5: toNumString(t) });
  };

  const onChangeC1 = (t: string) => {
    setCoins({ ...coins, c1: toNumString(t) });
  };

  const onPressClear = () => {
    setBills(defaultBills);
    setCoins(defaultCoins);
  };

  const onPressCheck1 = () => {
    if (actualCash - expectedCash > 0) {
      transactionStore.addItem({
        description: "Adjustments (+)",
        category: 54,
        amount: Math.abs(actualCash - expectedCash),
        transmitter: 11,
        receiver: 10,
      });
    } else if (actualCash - expectedCash < 0) {
      transactionStore.addItem({
        description: "Adjustments (-)",
        category: 54,
        amount: Math.abs(actualCash - expectedCash),
        transmitter: 10,
        receiver: 11,
      });
    }
    onPressClear();
  };

  const onPressCheck2 = () => {
    if (totalBillAmt(bills) > 0) {
      transactionStore.addItem({
        description: "Remit to Cash Box",
        category: 48,
        amount: totalBillAmt(bills),
        transmitter: 10,
        receiver: 9,
      });
    }

    if (totalCoinAmt(coins) > 0) {
      transactionStore.addItem({
        description: "Remit to Coin Box",
        category: 48,
        amount: totalCoinAmt(coins),
        transmitter: 10,
        receiver: 12,
      });
    }
    onPressClear();
  };

  const onPressCheck3 = () => {
    if (totalBillAmt(bills) > 0) {
      transactionStore.addItem({
        description: "Add Petty Cash",
        category: 48,
        amount: actualCash,
        transmitter: 9,
        receiver: 10,
      });
    }

    if (totalCoinAmt(coins) > 0) {
      transactionStore.addItem({
        description: "Remit to Coin Box",
        category: 48,
        amount: totalCoinAmt(coins),
        transmitter: 12,
        receiver: 10,
      });
    }
    onPressClear();
  };

  useEffect(() => {
    if (isVisible1) {
      accountStore.fetchAccounts();
    }
  }, [isVisible1]);

  console.log(expectedCash, actualCash);

  return (
    isVisible && (
      <View style={styles.main}>
        <MyOverlay
          title="Register a Tally"
          isVisible={isVisible1}
          setVisible={setVisible1}
          onPressCheck={onPressCheck1}
        >
          <HView>
            <MyText text="Expected" />
            <MyText text={toMoney(expectedCash)} />
          </HView>
          <HView>
            <MyText text="Actual" />
            <MyText text={toMoney(totalBillAmt(bills) + totalCoinAmt(coins))} />
          </HView>
          <HView>
            <MyText text="Difference" />
            <MyText
              text={toMoney(actualCash - expectedCash)}
              success={actualCash - expectedCash > 0}
              error={actualCash - expectedCash < 0}
            />
          </HView>
        </MyOverlay>
        <MyOverlay
          title="Remit Cash to Cash Box"
          isVisible={isVisible2}
          setVisible={setVisible2}
          onPressCheck={onPressCheck2}
        >
          <MyText
            text={`Transfer \u20b1${actualCash} to Cash Box.`}
            size="medium"
          />
        </MyOverlay>
        <MyOverlay
          title="Add Petty Cash/Coins"
          isVisible={isVisible3}
          setVisible={setVisible3}
          onPressCheck={onPressCheck3}
        >
          <MyText
            text={`Transfer \u20b1${actualCash} to Cash Register.`}
            size="medium"
          />
        </MyOverlay>
        <ModesBar
          actions={[
            { id: 1, name: "payments", label: "Petty Cash" },
            { id: 2, name: "compare", label: "Tally" },
            { id: 3, name: "description", label: "Report" },
            { id: 4, name: "analytics", label: "Analytics" },
          ]}
          mode={mode}
          setMode={setMode}
          onPressClear={onPressClear}
        />
        <View style={styles.body}>
          <HView hidden={mode === 4 || mode === 0}>
            <MyForm noBtn1 noBtn2>
              <MyText text="Bills" size="medium" highlight />
              <MyTextInput
                label={`\u20b11000`}
                value={bills.b1000}
                onChangeValue={onChangeB1000}
                numeric
                centered
              />
              <MyTextInput
                label={`\u20b1500`}
                value={bills.b500}
                onChangeValue={onChangeB500}
                numeric
                centered
              />
              <MyTextInput
                label={`\u20b1200`}
                value={bills.b200}
                onChangeValue={onChangeB200}
                numeric
                centered
              />
              <MyTextInput
                label={`\u20b1100`}
                value={bills.b100}
                onChangeValue={onChangeB100}
                numeric
                centered
              />
              <MyTextInput
                label={`\u20b150`}
                value={bills.b50}
                onChangeValue={onChangeB50}
                numeric
                centered
              />
              <MyTextInput
                label={`\u20b120`}
                value={bills.b20}
                onChangeValue={onChangeB20}
                numeric
                centered
              />
            </MyForm>
            <MyForm
              noBtn2
              hidden={mode === 4 || mode === 0}
              onPressBtn1={() =>
                mode === 1
                  ? setVisible3(true)
                  : mode === 2
                  ? setVisible1(true)
                  : setVisible2(true)
              }
              btn1Label={
                mode === 1 ? "Add PCV" : mode === 2 ? "Tally" : "Report"
              }
            >
              <MyText text="Coins" size="medium" highlight />

              <MyTextInput
                label={`\u20b120`}
                value={coins.c20}
                onChangeValue={onChangeC20}
                numeric
                centered
              />
              <MyTextInput
                label={`\u20b110`}
                value={coins.c10}
                onChangeValue={onChangeC10}
                numeric
                centered
              />
              <MyTextInput
                label={`\u20b15`}
                value={coins.c5}
                onChangeValue={onChangeC5}
                numeric
                centered
              />
              <MyTextInput
                label={`\u20b11`}
                value={coins.c1}
                onChangeValue={onChangeC1}
                numeric
                centered
              />
            </MyForm>
          </HView>
        </View>
        <MyStatusBar />
      </View>
    )
  );
});

const styles = StyleSheet.create({
  main: {
    flex: 1,
  },
  body: {
    flex: 1,
    margin: 3,
  },
  bar: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
});
