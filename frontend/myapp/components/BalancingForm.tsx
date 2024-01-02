import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { HView } from "../blueprints/HView";
import { ModesBar } from "../blueprints/ModesBar";
import { MyForm } from "../blueprints/MyForm";
import { MyList } from "../blueprints/MyList";
import { MyOverlay } from "../blueprints/MyOverlay";
import { MyStatusBar } from "../blueprints/MyStatusBar";
import { MyText } from "../blueprints/MyText";
import { MyTextInput } from "../blueprints/MyTextInput";
import { defaultBills, defaultCoins } from "../constants/constants";
import {
  Bills,
  Coins,
  toMoney,
  toNumString,
  totalBillAmt,
  totalCoinAmt,
} from "../constants/helpers";
import { accountStore } from "../stores/AccountStore";
import { useStore } from "../stores/Store";
import { MyCard } from "../blueprints/MyCard";
import { AnalyticsList } from "../components/AnalyticsList";
import { BillsForm } from "../blueprints/BillsForm";
import { CoinsForm } from "../blueprints/CoinsForm";

export const BalancingForm = observer(
  (props: {
    hidden?: boolean;
    mode: number;
    bills: Bills;
    setBills: React.Dispatch<React.SetStateAction<Bills>>;
    coins: Coins;
    setCoins: React.Dispatch<React.SetStateAction<Coins>>;
  }) => {
    const { transactionStore } = useStore();

    const { mode, bills, setBills, coins, setCoins } = props;

    const [isVisible1, setVisible1] = useState(false); // Add PCV Bills
    const [isVisible2, setVisible2] = useState(false); // Add PCV Coins
    const [isVisible3, setVisible3] = useState(false); // Add Tally Bills
    const [isVisible4, setVisible4] = useState(false); // Add Tally Coins
    const [isVisible5, setVisible5] = useState(false); // Add Tally All
    const [isVisible6, setVisible6] = useState(false); // Remit Bills
    const [isVisible7, setVisible7] = useState(false); // Remit Coins
    const [mode2, setMode2] = useState(1);

    const expectedCash =
      (accountStore.getItem(10)?.received ?? 0) -
      (accountStore.getItem(10)?.transmitted ?? 0);

    const expectedCashBox =
      (accountStore.getItem(9)?.received ?? 0) -
      (accountStore.getItem(9)?.transmitted ?? 0);

    const expectedCoinBox =
      (accountStore.getItem(12)?.received ?? 0) -
      (accountStore.getItem(12)?.transmitted ?? 0);

    const actualCash = totalBillAmt(bills) + totalCoinAmt(coins);

    const onPressCheck1 = () => {
      if (totalBillAmt(bills) > 0) {
        transactionStore.addItem({
          description: "Add Petty Cash (Bills)",
          category: 48,
          amount: totalBillAmt(bills),
          transmitter: 9,
          receiver: 10,
        });
      }
      setBills(defaultBills);
    };

    const onPressCheck2 = () => {
      if (totalCoinAmt(coins) > 0) {
        transactionStore.addItem({
          description: "Add Petty Cash (Coins)",
          category: 48,
          amount: totalCoinAmt(coins),
          transmitter: 12,
          receiver: 10,
        });
      }
      setCoins(defaultCoins);
    };

    const onPressCheck3 = () => {
      if (totalBillAmt(bills) - expectedCashBox > 0) {
        transactionStore.addItem({
          description: "Cash Box - Bills Adjustments (+)",
          category: 54,
          amount: Math.abs(totalBillAmt(bills) - expectedCashBox),
          transmitter: 11,
          receiver: 9,
        });
      } else if (totalBillAmt(bills) - expectedCashBox < 0) {
        transactionStore.addItem({
          description: "Cash Box - Bills Adjustments (-)",
          category: 54,
          amount: Math.abs(totalBillAmt(bills) - expectedCashBox),
          transmitter: 9,
          receiver: 11,
        });
      }
      setBills(defaultBills);
    };

    const onPressCheck4 = () => {
      if (totalCoinAmt(coins) - expectedCoinBox > 0) {
        transactionStore.addItem({
          description: "Cash Box - Coins Adjustments (+)",
          category: 54,
          amount: Math.abs(totalCoinAmt(coins) - expectedCoinBox),
          transmitter: 11,
          receiver: 12,
        });
      } else if (totalCoinAmt(coins) - expectedCoinBox < 0) {
        transactionStore.addItem({
          description: "Cash Box - Coins Adjustments (-)",
          category: 54,
          amount: Math.abs(totalCoinAmt(coins) - expectedCoinBox),
          transmitter: 12,
          receiver: 11,
        });
      }
      setCoins(defaultCoins);
    };

    const onPressCheck5 = () => {
      if (actualCash - expectedCash > 0) {
        transactionStore.addItem({
          description: "Cash Register Adjustments (+)",
          category: 54,
          amount: Math.abs(actualCash - expectedCash),
          transmitter: 11,
          receiver: 10,
        });
      } else if (actualCash - expectedCash < 0) {
        transactionStore.addItem({
          description: "Cash Register Adjustments (-)",
          category: 54,
          amount: Math.abs(actualCash - expectedCash),
          transmitter: 10,
          receiver: 11,
        });
      }
      setBills(defaultBills);
      setCoins(defaultCoins);
    };

    const onPressCheck6 = () => {
      if (totalBillAmt(bills) > 0) {
        transactionStore.addItem({
          description: "Remit to Cash Box (Bills)",
          category: 48,
          amount: totalBillAmt(bills),
          transmitter: 10,
          receiver: 9,
        });
      }
      setBills(defaultBills);
    };

    const onPressCheck7 = () => {
      if (totalCoinAmt(coins) > 0) {
        transactionStore.addItem({
          description: "Remit to Coin Box (Coins)",
          category: 48,
          amount: totalCoinAmt(coins),
          transmitter: 10,
          receiver: 12,
        });
      }
      setCoins(defaultCoins);
    };

    const onPressBills = () => {
      if (mode === 1) setVisible1(true);
      if (mode === 2) setVisible3(true);
      if (mode === 3) setVisible6(true);
    };

    const onPressCoins = () => {
      if (mode === 1) setVisible2(true);
      if (mode === 2 && mode2 === 2) setVisible4(true);
      if (mode === 2 && mode2 === 1) setVisible5(true);
      if (mode === 3) setVisible7(true);
    };

    const btnBillsLabel =
      mode === 1 ? "PCV Bills" : mode === 2 ? "Tally Bills" : "Remit Bills";

    const btnCoinsLabel =
      mode === 1
        ? "PCV Coins"
        : mode === 2
        ? mode2 === 2
          ? "Tally Coins"
          : "Tally All"
        : "Remit Coins";

    useEffect(() => {
      setBills(defaultBills);
      setCoins(defaultCoins);
    }, [mode]);

    useEffect(() => {
      if (isVisible3 || isVisible4 || isVisible5) {
        accountStore.fetchAll();
      }
    }, [isVisible3, isVisible4, isVisible5]);

    return (
      <>
        <HView hidden={mode === 4 || mode === 0}>
          <MyOverlay // # 1
            title="Add Petty Cash (Bills)"
            isVisible={isVisible1}
            setVisible={setVisible1}
            onPressCheck={onPressCheck1}
          >
            <MyText
              text={`Transfer \u20b1${totalBillAmt(bills)} to Cash Register.`}
              size="medium"
            />
          </MyOverlay>
          <MyOverlay // # 2
            title="Add Petty Cash (Coins)"
            isVisible={isVisible2}
            setVisible={setVisible2}
            onPressCheck={onPressCheck2}
          >
            <MyText
              text={`Transfer \u20b1${totalCoinAmt(coins)} to Cash Register.`}
              size="medium"
            />
          </MyOverlay>
          <MyOverlay // # 3
            title="Register a Tally (Cash Box Bills)"
            isVisible={isVisible3}
            setVisible={setVisible3}
            onPressCheck={onPressCheck3}
          >
            <HView>
              <MyText text="Expected" />
              <MyText text={toMoney(expectedCashBox)} />
            </HView>
            <HView>
              <MyText text="Actual" />
              <MyText text={toMoney(totalBillAmt(bills))} />
            </HView>
            <HView>
              <MyText text="Difference" />
              <MyText
                text={toMoney(actualCash - expectedCashBox)}
                success={actualCash - expectedCashBox > 0}
                error={actualCash - expectedCashBox < 0}
              />
            </HView>
          </MyOverlay>
          <MyOverlay // # 4
            title="Register a Tally (Cash Box Coins)"
            isVisible={isVisible4}
            setVisible={setVisible4}
            onPressCheck={onPressCheck4}
          >
            <HView>
              <MyText text="Expected" />
              <MyText text={toMoney(expectedCoinBox)} />
            </HView>
            <HView>
              <MyText text="Actual" />
              <MyText text={toMoney(totalCoinAmt(coins))} />
            </HView>
            <HView>
              <MyText text="Difference" />
              <MyText
                text={toMoney(actualCash - expectedCoinBox)}
                success={actualCash - expectedCoinBox > 0}
                error={actualCash - expectedCoinBox < 0}
              />
            </HView>
          </MyOverlay>
          <MyOverlay // # 5
            title="Register a Tally (Cash Register)"
            isVisible={isVisible5}
            setVisible={setVisible5}
            onPressCheck={onPressCheck5}
          >
            <HView>
              <MyText text="Expected" />
              <MyText text={toMoney(expectedCash)} />
            </HView>
            <HView>
              <MyText text="Actual" />
              <MyText
                text={toMoney(totalBillAmt(bills) + totalCoinAmt(coins))}
              />
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
          <MyOverlay // # 6
            title="Remit Bills to Cash Box"
            isVisible={isVisible6}
            setVisible={setVisible6}
            onPressCheck={onPressCheck6}
          >
            <MyText
              text={`Transfer \u20b1${totalBillAmt(bills)} to Cash Box.`}
              size="medium"
            />
          </MyOverlay>
          <MyOverlay // # 7
            title="Remit Coins to Cash Box"
            isVisible={isVisible7}
            setVisible={setVisible7}
            onPressCheck={onPressCheck7}
          >
            <MyText
              text={`Transfer \u20b1${totalCoinAmt(coins)} to Coins Box.`}
              size="medium"
            />
          </MyOverlay>
          <BillsForm
            bills={bills}
            setBills={setBills}
            onPressBtn1={onPressBills}
            noBtn1={mode2 === 1 && mode === 2}
            btn1Label={btnBillsLabel}
          />
          <CoinsForm
            coins={coins}
            setCoins={setCoins}
            btn1Label={btnCoinsLabel}
            onPressBtn1={onPressCoins}
          />
        </HView>
        <ModesBar
          actions={[
            { id: 1, name: "point-of-sale", label: "Cash Register" },
            { id: 2, name: "payments", label: "Cash Box" },
          ]}
          mode={mode2}
          setMode={setMode2}
          noSideBtns
          hidden={mode !== 2}
        />
      </>
    );
  }
);
