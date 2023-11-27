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
  toMoney,
  toNumString,
  totalBillAmt,
  totalCoinAmt,
} from "../constants/helpers";
import { accountStore } from "../stores/AccountStore";
import { useStore } from "../stores/Store";
import { countItemStore } from "../stores/CountItemStore";
import { MyCard } from "../blueprints/MyCard";

const actions = [
  { id: 1, name: "arrow-drop-down", label: "5Y", interval: 1800 },
  { id: 2, name: "arrow-drop-down", label: "2Y", interval: 730 },
  { id: 3, name: "arrow-drop-down", label: "1Y", interval: 365 },
  { id: 4, name: "arrow-drop-down", label: "1Q", interval: 90 },
  { id: 5, name: "arrow-drop-down", label: "1M", interval: 30 },
  { id: 6, name: "arrow-drop-down", label: "1W", interval: 7 },
  { id: 7, name: "arrow-drop-down", label: "1D", interval: 1 },
];

export const A5BalanceView = observer((props: { isVisible?: boolean }) => {
  const { isVisible } = props;

  const {
    transactionStore,
    salesItemStore,
    laborItemStore,
    returnedItemStore,
    purchaseItemStore,
    saleStore,
  } = useStore();

  const [isVisible1, setVisible1] = useState(false);
  const [isVisible2, setVisible2] = useState(false);
  const [isVisible3, setVisible3] = useState(false);
  const [mode, setMode] = useState(0);
  const [range, setRange] = useState(1);
  const [bills, setBills] = useState(defaultBills);
  const [coins, setCoins] = useState(defaultCoins);
  const [salesItemDetails, setSalesItemDetails] = useState<{
    gross_sales_from_goods_paid: number;
    gross_sales_from_goods_unpaid: number;
    gross_sales_from_goods_validating: number;
    sales_profit_from_goods_paid: number;
    sales_profit_from_goods_unpaid: number;
    sales_profit_from_goods_validating: number;
  }>();
  const [laborItemDetails, setLaborItemDetails] = useState<{
    owed_labor: number;
    returned_labor: number;
    receive_labor_paid: number;
    receive_labor_unpaid: number;
    receive_labor_validating: number;
  }>();
  const [returnedItemDetails, setReturnedItemDetails] = useState<{
    returned_sales_from_goods: number;
  }>();
  const [salesDetails, setSalesDetails] = useState<{
    total_discount: number;
  }>();
  const [purchaseItemDetails, setPurchaseDetails] = useState<{
    total_purchased_goods_cost: number;
    total_purchased_goods_worth: number;
  }>();
  const [countItemDetails, setCountItemDetails] = useState<{
    lost_gained_goods: number;
  }>();
  const [transactionDetails, setTransactionDetails] = useState<{
    adjustments_added: number;
    adjustments_deducted: number;
    operating_expenses: number;
    other_incomes: number;
  }>();

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

  const getAnalytics = async () => {
    const r1 = await salesItemStore.fetchAnalytics({
      range: actions[range - 1].label,
    });
    const r2 = await laborItemStore.fetchAnalytics({
      range: actions[range - 1].label,
    });
    const r3 = await returnedItemStore.fetchAnalytics({
      range: actions[range - 1].label,
    });
    const r4 = await purchaseItemStore.fetchAnalytics({
      range: actions[range - 1].label,
    });
    const r5 = await countItemStore.fetchAnalytics({
      range: actions[range - 1].label,
    });
    const r6 = await saleStore.fetchAnalytics({
      range: actions[range - 1].label,
    });
    const r7 = await transactionStore.fetchAnalytics({
      range: actions[range - 1].label,
    });

    if (
      !r1.data ||
      !r2.data ||
      !r3.data ||
      !r4.data ||
      !r5.data ||
      !r6.data ||
      !r7.data
    )
      return;
    setSalesItemDetails(r1.data);
    setLaborItemDetails(r2.data);
    setReturnedItemDetails(r3.data);
    setPurchaseDetails(r4.data);
    setCountItemDetails(r5.data);
    setSalesDetails(r6.data);
    setTransactionDetails(r7.data);
  };

  useEffect(() => {
    if (isVisible1) {
      accountStore.fetchAll();
    }
  }, [isVisible1]);

  useEffect(() => {
    getAnalytics();
  }, [range]);

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
          <MyList hidden={mode !== 4} scrollable>
            <ModesBar
              actions={actions}
              mode={range}
              setMode={setRange}
              noSideBtns
            />
            <MyCard
              item={{ id: 1 }}
              details={[
                { id: 2, text: "Gross Sales from Goods (Paid)", type: "main" },
              ]}
              price={salesItemDetails?.gross_sales_from_goods_paid}
              hidden={!salesItemDetails?.gross_sales_from_goods_paid}
              unit=" "
            />
            <MyCard
              item={{ id: 1 }}
              details={[
                {
                  id: 2,
                  text: "Gross Sales from Goods (Validating)",
                  type: "main",
                },
              ]}
              price={salesItemDetails?.gross_sales_from_goods_validating}
              hidden={!salesItemDetails?.gross_sales_from_goods_validating}
              unit=" "
            />
            <MyCard
              item={{ id: 1 }}
              details={[
                {
                  id: 2,
                  text: "Gross Sales from Goods (Unpaid)",
                  type: "main",
                },
              ]}
              price={salesItemDetails?.gross_sales_from_goods_unpaid}
              hidden={!salesItemDetails?.gross_sales_from_goods_unpaid}
              unit=" "
            />
            <MyCard
              item={{ id: 1 }}
              details={[
                {
                  id: 2,
                  text: "Profit from Goods (Paid)",
                  type: "main",
                },
              ]}
              price={salesItemDetails?.sales_profit_from_goods_paid}
              hidden={!salesItemDetails?.sales_profit_from_goods_paid}
              unit=" "
            />
            <MyCard
              item={{ id: 1 }}
              details={[
                {
                  id: 2,
                  text: "Profit from Goods (Validating)",
                  type: "main",
                },
              ]}
              price={salesItemDetails?.sales_profit_from_goods_validating}
              hidden={!salesItemDetails?.sales_profit_from_goods_validating}
              unit=" "
            />
            <MyCard
              item={{ id: 1 }}
              details={[
                {
                  id: 2,
                  text: "Profit from Goods (Unpaid)",
                  type: "main",
                },
              ]}
              price={salesItemDetails?.sales_profit_from_goods_unpaid}
              hidden={!salesItemDetails?.sales_profit_from_goods_unpaid}
              unit=" "
            />
            <MyCard
              item={{ id: 1 }}
              details={[
                {
                  id: 2,
                  text: "Gross Sales from Labor (Paid)",
                  type: "main",
                },
              ]}
              price={laborItemDetails?.receive_labor_paid}
              hidden={!laborItemDetails?.receive_labor_paid}
              unit=" "
            />
            <MyCard
              item={{ id: 1 }}
              details={[
                {
                  id: 2,
                  text: "Gross Sales from Labor (Validating)",
                  type: "main",
                },
              ]}
              price={laborItemDetails?.receive_labor_validating}
              hidden={!laborItemDetails?.receive_labor_validating}
              unit=" "
            />
            <MyCard
              item={{ id: 1 }}
              details={[
                {
                  id: 2,
                  text: "Gross Sales from Labor (Unpaid)",
                  type: "main",
                },
              ]}
              price={laborItemDetails?.receive_labor_unpaid}
              hidden={!laborItemDetails?.receive_labor_unpaid}
              unit=" "
            />
            <MyCard
              item={{ id: 1 }}
              details={[
                {
                  id: 2,
                  text: "Total Labor Cost",
                  type: "main",
                },
              ]}
              price={laborItemDetails && -laborItemDetails.owed_labor}
              hidden={!laborItemDetails?.owed_labor}
              unit=" "
            />
            <MyCard
              item={{ id: 1 }}
              details={[
                {
                  id: 2,
                  text: "Total Labor Unclaimed by Mechanic",
                  type: "main",
                },
              ]}
              price={
                (laborItemDetails?.owed_labor ?? 0) -
                (laborItemDetails?.returned_labor ?? 0)
              }
              hidden={
                (laborItemDetails?.owed_labor ?? 0) -
                  (laborItemDetails?.returned_labor ?? 0) ===
                0
              }
              unit=" "
            />
            <MyCard
              item={{ id: 1 }}
              details={[
                {
                  id: 2,
                  text: "Total Discount Given",
                  type: "main",
                },
              ]}
              price={salesDetails?.total_discount}
              hidden={!salesDetails?.total_discount}
              unit=" "
            />
            <MyCard
              item={{ id: 1 }}
              details={[
                {
                  id: 2,
                  text: "Refunded Goods",
                  type: "main",
                },
              ]}
              price={
                returnedItemDetails &&
                -returnedItemDetails?.returned_sales_from_goods
              }
              hidden={!returnedItemDetails?.returned_sales_from_goods}
              unit=" "
            />
            <MyCard
              item={{ id: 1 }}
              details={[
                {
                  id: 2,
                  text: "Total Added/Purchased Goods",
                  type: "main",
                },
              ]}
              price={purchaseItemDetails?.total_purchased_goods_cost}
              hidden={!purchaseItemDetails?.total_purchased_goods_cost}
              unit=" "
            />
            <MyCard
              item={{ id: 1 }}
              details={[
                {
                  id: 2,
                  text: "Estimated Profit from Added Goods",
                  type: "main",
                },
              ]}
              price={
                (purchaseItemDetails?.total_purchased_goods_worth ?? 0) -
                (purchaseItemDetails?.total_purchased_goods_cost ?? 0)
              }
              hidden={!purchaseItemDetails?.total_purchased_goods_worth}
              unit=" "
            />
            <MyCard
              item={{ id: 1 }}
              details={[
                {
                  id: 2,
                  text: "Adjustments (Untracked)",
                  type: "main",
                },
              ]}
              price={
                (transactionDetails?.adjustments_added ?? 0) -
                (transactionDetails?.adjustments_deducted ?? 0)
              }
              hidden={
                !transactionDetails?.adjustments_added &&
                !transactionDetails?.adjustments_deducted
              }
              unit=" "
            />
            <MyCard
              item={{ id: 1 }}
              details={[
                {
                  id: 2,
                  text: "Operating Expenses",
                  type: "main",
                },
              ]}
              price={
                transactionDetails && -transactionDetails?.operating_expenses
              }
              hidden={!transactionDetails?.operating_expenses}
              unit=" "
            />
            <MyCard
              item={{ id: 1 }}
              details={[
                {
                  id: 2,
                  text: "Other Incomes",
                  type: "main",
                },
              ]}
              price={transactionDetails?.other_incomes}
              hidden={!transactionDetails?.other_incomes}
              unit=" "
            />
          </MyList>
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
