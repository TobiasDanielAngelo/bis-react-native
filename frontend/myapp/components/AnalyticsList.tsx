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

export const AnalyticsList = (props: { hidden?: boolean }) => {
  const { hidden } = props;

  const {
    transactionStore,
    salesItemStore,
    laborItemStore,
    returnedItemStore,
    saleStore,
  } = useStore();

  const [range, setRange] = useState(7);
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
    returned_sales_from_goods_profit: number;
  }>();
  const [salesDetails, setSalesDetails] = useState<{
    total_discount: number;
  }>();
  const [transactionDetails, setTransactionDetails] = useState<{
    adjustments_added: number;
    adjustments_deducted: number;
    adjustments_added_stocks: number;
    adjustments_deducted_stocks: number;
    replenished_stocks: number;
    parts_expenses: number;
    other_expenses: number;
    other_incomes: number;
  }>();

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
    const r6 = await saleStore.fetchAnalytics({
      range: actions[range - 1].label,
    });
    const r7 = await transactionStore.fetchAnalytics({
      range: actions[range - 1].label,
    });

    if (!r1.data || !r2.data || !r3.data || !r6.data || !r7.data) return;
    setSalesItemDetails(r1.data);
    setLaborItemDetails(r2.data);
    setReturnedItemDetails(r3.data);
    setSalesDetails(r6.data);
    setTransactionDetails(r7.data);
  };

  const gross_sales_goods =
    (salesItemDetails?.gross_sales_from_goods_paid ?? 0) +
    (salesItemDetails?.gross_sales_from_goods_validating ?? 0) +
    (salesItemDetails?.gross_sales_from_goods_unpaid ?? 0) -
    (returnedItemDetails?.returned_sales_from_goods ?? 0);

  const net_sales_goods =
    (salesItemDetails?.sales_profit_from_goods_paid ?? 0) +
    (salesItemDetails?.sales_profit_from_goods_validating ?? 0) +
    (salesItemDetails?.sales_profit_from_goods_unpaid ?? 0) -
    (returnedItemDetails?.returned_sales_from_goods_profit ?? 0);

  const cost_of_goods = gross_sales_goods - net_sales_goods;

  const discounts = salesDetails?.total_discount ?? 0;

  const gross_sales_labor =
    (laborItemDetails?.receive_labor_paid ?? 0) +
    (laborItemDetails?.receive_labor_validating ?? 0) +
    (laborItemDetails?.receive_labor_unpaid ?? 0);

  const cost_of_labor = laborItemDetails?.owed_labor ?? 0;

  const net_sales_labor = gross_sales_labor - cost_of_labor;

  useEffect(() => {
    if (!hidden) {
      getAnalytics();
    }
  }, [range, hidden]);

  return (
    <MyList hidden={hidden} scrollable>
      <ModesBar actions={actions} mode={range} setMode={setRange} noSideBtns />
      <MyCard
        item={{ id: 1 }}
        details={[{ id: 2, text: "Summary (RECORDED)", type: "main" }]}
      >
        <MyCard
          item={{ id: 1 }}
          details={[{ id: 2, text: "Summary - Goods (Parts)", type: "main" }]}
        >
          <MyCard
            item={{ id: 1 }}
            details={[
              { id: 2, text: "Gross Revenue from Goods", type: "main" },
              {
                id: 3,
                text: `Validating: \u20b1${toMoney(
                  salesItemDetails?.gross_sales_from_goods_validating ?? 0
                )}`,
                type: "sub",
              },
              {
                id: 4,
                text: `Unpaid: \u20b1${toMoney(
                  salesItemDetails?.gross_sales_from_goods_unpaid ?? 0
                )}`,
                type: "sub",
              },
            ]}
            price={gross_sales_goods}
            unit=" "
          />
          <MyCard
            item={{ id: 1 }}
            details={[
              {
                id: 2,
                text: "Less: Cost of Goods Sold",
                type: "main",
              },
            ]}
            price={-cost_of_goods}
            unit=" "
          />

          <MyCard
            item={{ id: 1 }}
            details={[
              {
                id: 2,
                text: "Gross Profit from Goods",
                type: "main",
              },
              {
                id: 3,
                text: `Validating: \u20b1${toMoney(
                  salesItemDetails?.sales_profit_from_goods_validating ?? 0
                )}`,
                type: "sub",
              },
              {
                id: 4,
                text: `Unpaid: \u20b1${toMoney(
                  salesItemDetails?.sales_profit_from_goods_unpaid ?? 0
                )}`,
                type: "sub",
              },
            ]}
            price={net_sales_goods}
            unit=" "
          />
        </MyCard>
        <MyCard
          item={{ id: 1 }}
          details={[
            { id: 2, text: "Summary - Services (Labor)", type: "main" },
          ]}
        >
          <MyCard
            item={{ id: 1 }}
            details={[
              {
                id: 2,
                text: "Gross Sales from Labor",
                type: "main",
              },
              {
                id: 3,
                text: `Validating: \u20b1${toMoney(
                  laborItemDetails?.receive_labor_validating ?? 0
                )}`,
                type: "sub",
              },
              {
                id: 4,
                text: `Unpaid: \u20b1${toMoney(
                  laborItemDetails?.receive_labor_unpaid ?? 0
                )}`,
                type: "sub",
              },
            ]}
            price={gross_sales_labor}
            unit=" "
          />
          <MyCard
            item={{ id: 1 }}
            details={[
              {
                id: 2,
                text: `Less: Cost of Labor`,
                type: "main",
              },
              {
                id: 3,
                text: `Unclaimed: \u20b1${toMoney(
                  (laborItemDetails?.owed_labor ?? 0) -
                    (laborItemDetails?.returned_labor ?? 0)
                )}`,
                type: "sub",
              },
            ]}
            price={-cost_of_labor}
            unit=" "
          />
          <MyCard
            item={{ id: 1 }}
            details={[
              {
                id: 2,
                text: "Gross Profit from Labor",
                type: "main",
              },
            ]}
            price={net_sales_labor}
            unit=" "
          />
        </MyCard>
        <MyCard
          item={{ id: 1 }}
          details={[{ id: 2, text: "Summary - Expenses", type: "main" }]}
        >
          <MyCard
            item={{ id: 1 }}
            details={[
              {
                id: 2,
                text: "Others",
                type: "main",
              },
            ]}
            price={
              transactionDetails &&
              -(
                transactionDetails?.other_expenses -
                transactionDetails?.parts_expenses
              )
            }
            unit=" "
          />
          <MyCard
            item={{ id: 1 }}
            details={[
              {
                id: 2,
                text: "Stocks",
                type: "main",
              },
            ]}
            price={transactionDetails && -transactionDetails?.parts_expenses}
            unit=" "
          />
        </MyCard>
        <MyCard
          item={{ id: 1 }}
          details={[
            {
              id: 2,
              text: "Less: Discounts",
              type: "main",
            },
          ]}
          price={-discounts}
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
          price={
            (transactionDetails?.other_incomes ?? 0) -
            (transactionDetails?.replenished_stocks ?? 0)
          }
          unit=" "
        />
        <MyCard
          item={{ id: 1 }}
          details={[
            {
              id: 2,
              text: "Net Profit",
              type: "main",
            },
          ]}
          price={
            net_sales_goods +
            net_sales_labor -
            discounts -
            (transactionDetails?.other_expenses ?? 0) +
            (transactionDetails?.other_incomes ?? 0) -
            (transactionDetails?.replenished_stocks ?? 0)
          }
          unit=" "
        />
      </MyCard>

      <MyCard
        item={{ id: 1 }}
        details={[{ id: 2, text: "Adjustments (UNRECORDED)", type: "main" }]}
      >
        <MyCard
          item={{ id: 1 }}
          details={[
            {
              id: 2,
              text: "Cash Adjustments",
              type: "main",
            },
          ]}
          price={
            (transactionDetails?.adjustments_added ?? 0) -
            (transactionDetails?.adjustments_deducted ?? 0)
          }
          unit=" "
        />
        <MyCard
          item={{ id: 1 }}
          details={[
            {
              id: 2,
              text: "Stocks Adjustments",
              type: "main",
            },
          ]}
          price={
            (transactionDetails?.adjustments_added_stocks ?? 0) -
            (transactionDetails?.adjustments_deducted_stocks ?? 0)
          }
          unit=" "
        />
      </MyCard>
      <MyCard
        item={{ id: 1 }}
        details={[{ id: 2, text: "Summary - Stocks", type: "main" }]}
      >
        <MyCard
          item={{ id: 1 }}
          details={[
            {
              id: 2,
              text: "Purchased Stocks",
              type: "main",
            },
          ]}
          price={transactionDetails?.replenished_stocks ?? 0}
          unit=" "
        />
        <MyCard
          item={{ id: 1 }}
          details={[
            {
              id: 2,
              text: "Sold Stocks",
              type: "main",
            },
          ]}
          price={-gross_sales_goods}
          unit=" "
        />
        <MyCard
          item={{ id: 1 }}
          details={[
            {
              id: 2,
              text: "Net Stocks (Change, +/-)",
              type: "main",
            },
          ]}
          price={
            (transactionDetails?.replenished_stocks ?? 0) - gross_sales_goods
          }
          unit=" "
        />
      </MyCard>
    </MyList>
  );
};
