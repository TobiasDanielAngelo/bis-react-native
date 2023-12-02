import { useCallback, useEffect, useState } from "react";
import { HView } from "../blueprints/HView";
import { MyOverlay } from "../blueprints/MyOverlay";
import { MyStatusBar } from "../blueprints/MyStatusBar";
import { MyText } from "../blueprints/MyText";
import { MyTextInput } from "../blueprints/MyTextInput";
import { toNumber, toNumString, totalValue } from "../constants/helpers";
import { toMoney } from "../constants/helpers";
import { SaleInterface, saleStore } from "../stores/SalesStore";
import { doNothing } from "../constants/constants";
import { useStore } from "../stores/Store";
import { observer } from "mobx-react-lite";
import { MyIcon } from "../blueprints/MyIcon";
import { MyDatePicker } from "../blueprints/MyDatePicker";

export const SalesStatusBar = observer(
  <
    T extends {
      name: string;
      label?: string;
      selected?: boolean;
      onPress?: () => void;
      onLongPress?: () => void;
    }
  >(props: {
    leftText?: string;
    rightText?: string;
    leftAction?: () => void;
    rightAction?: () => void;
    action1?: T;
    action2?: T;
    action3?: T;
    hidden?: boolean;
    amount?: number;
    sale?: SaleInterface;
  }) => {
    const {
      hidden,
      amount,
      action1,
      action2,
      action3,
      leftText,
      rightText,
      leftAction,
      rightAction,
      sale,
    } = props;

    const {
      transactionStore,
      accountStore,
      mechanicStore,
      receivableStore,
      userStore,
    } = useStore();
    const [isVisible1, setVisible1] = useState(false);
    const [isVisible2, setVisible2] = useState(false);
    const [isVisible3, setVisible3] = useState(false);
    const [isVisible4, setVisible4] = useState(false);
    const [cashAmount, setCashAmount] = useState("");
    const [gcashAmount, setGcashAmount] = useState("0");
    const [discountAmount, setDiscountAmount] = useState("0");
    const [date, setDate] = useState(new Date());

    const onPressList = useCallback(async () => {
      setVisible1(true);
    }, []);

    const onPressPayment = useCallback(async () => {
      setVisible2(true);
    }, []);

    const onPressProcess = useCallback(async () => {
      setVisible3(true);
    }, []);

    const onPressPrint = async () => {
      if (!sale?.id) return;
      await saleStore.updateItem(sale.id, {
        to_print: !sale.to_print,
      });
    };

    const onChangeCashAmount = useCallback((t: string) => {
      setCashAmount(toNumString(t, true));
    }, []);

    const onChangeGcashAmount = useCallback((t: string) => {
      setGcashAmount(toNumString(t, true));
    }, []);

    const onChangeDiscountAmount = useCallback((t: string) => {
      setDiscountAmount(toNumString(t, true));
    }, []);

    const onPressCheck1 = async () => {
      if (!sale?.id) return;
      let payments = [];

      if (toNumber(cashAmount) > 0) {
        const resp1 = await transactionStore.addItem({
          description: `Payment for Sale # ${sale?.id}`,
          amount: toNumber(cashAmount),
          transmitter: 14,
          receiver: 10,
          category: 1,
        });
        if (resp1.data?.id) payments.push(resp1.data?.id);
      }
      if (toNumber(gcashAmount) > 0) {
        const resp2 = await transactionStore.addItem({
          description: `Payment for Sale # ${sale?.id}`,
          amount: toNumber(gcashAmount),
          transmitter: 14,
          receiver: 5,
          category: 1,
        });
        if (resp2.data?.id) payments.push(resp2.data?.id);
      }

      if (discount > 0) {
        const resp3 = await transactionStore.addItem({
          description: `Discount for Sale # ${sale?.id}`,
          amount: discount,
          transmitter: 10,
          receiver: 14,
          category: 1,
        });
        saleStore.updateItem(sale.id, { discount: discount });
        if (resp3.data?.id) payments.push(resp3.data?.id);
      }

      if (payments.length > 0 && sale?.id) {
        await saleStore.updateItem(sale.id, { payment: payments, status: "2" });
      }
    };

    const onPressUndo = async () => {
      if (sale?.returned_item && sale?.returned_item?.length > 0) return;
      if (sale?.id)
        await saleStore.updateItem(sale.id, {
          payment: [],
          status: "1",
          discount: 0,
        });
      sale?.payment?.forEach((s) => transactionStore.deleteItem(s));
      for (let i = 0; i < (sale?.labor_item?.length ?? 0); i++) {
        if (!sale?.labor_item) return;
        onPressStar(sale.labor_item[i].id, 0);
      }
    };

    const onPressUnprocess = async () => {
      if (!sale?.id || !sale?.returned_item) return;
      if (sale?.returned_item?.length > 0) return;
      await saleStore.updateItem(sale.id, {
        status: "1",
        payment: [],
        discount: 0,
      });
      for (let i = 0; i < (sale?.payment?.length ?? 0); i++) {
        if (!sale.payment) return;
        transactionStore.deleteItem(sale.payment[i]);
      }
      for (let i = 0; i < (sale?.labor_item?.length ?? 0); i++) {
        if (!sale?.labor_item) return;
        onPressStar(sale.labor_item[i].id, 0);
      }
    };

    const getPayments = async () => {
      let missingIds = [] as number[];
      if (!sale?.id) return;
      sale.payment?.forEach((s) => {
        if (!transactionStore.getItem(s)) missingIds.push(s);
      });
      if (missingIds.length > 0) transactionStore.fetchAll({ ids: missingIds });
    };

    const cash = toNumber(cashAmount);
    const gcash = toNumber(gcashAmount);
    const discount = toNumber(discountAmount);

    const accountTransmitter = (t: number) => {
      return accountStore.getItem(transactionStore.getItem(t)?.transmitter)
        ?.name;
    };

    const accountReceiver = (t: number) => {
      let receiver = accountStore.getItem(
        transactionStore.getItem(t)?.receiver
      )?.name;
      return receiver === "STOCKS" ? "" : receiver;
    };

    const amountReceived = (t: number) => {
      return transactionStore.getItem(t)?.amount;
    };

    const amountPaid = totalValue(
      sale?.payment?.map(
        (s) =>
          (accountReceiver(s) === "STOCKS"
            ? -1
            : accountTransmitter(s) === "STOCKS"
            ? 1
            : 0) * (amountReceived(s) ?? 0)
      )
    );

    const onPressStar = async (t: number, amountReturned: number) => {
      if (!sale?.id) return;
      saleStore.updateItemParticularLabor(
        { amount_returned: amountReturned },
        sale?.id,
        t
      );
    };

    const totalAmountReturned = totalValue(
      sale?.labor_item?.map((s) => s.amount_returned)
    );

    const totalDiscount = sale?.discount ?? 0;

    const changeOutput = amount ? -(amount - cash - gcash - discount) : 0;
    const changeAmount = amount
      ? -(amount - amountPaid - totalAmountReturned - totalDiscount)
      : 0;

    const salesTotal = totalValue(
      sale?.sales_item?.map((s) => s.quantity * s.selling_price)
    );
    const laborTotal = totalValue(
      sale?.labor_item?.map((s) => s.amount_received)
    );

    const laborTotalOwed = totalValue(
      sale?.labor_item
        ?.filter((s) => s.mechanic !== 1)
        .map((s) => s.amount_owed)
    );

    const closable =
      sale?.sales_item
        ?.map((s) => s.is_claimed)
        .reduce((a, b) => a && b, true) &&
      sale?.labor_item
        ?.filter((s) => s.mechanic !== 1) // DATS
        .map((s) => s.is_done)
        .reduce((a, b) => a && b, true) &&
      totalAmountReturned === laborTotalOwed;

    const onPressClose = async () => {
      if (!sale?.id || !closable) return;
      saleStore.updateItem(sale.id, {
        datetime_closed: new Date().toISOString(),
        is_active: false,
        to_print: false,
      });
    };

    const onPressCreateReceivable = () => {
      setVisible4(true);
    };

    const onPressCheck2 = async () => {
      if (!sale?.id || changeAmount < 0) return;
      let payments = sale.payment?.slice() ?? [];

      for (let i = 0; i < (sale.labor_item?.length ?? 0); i++) {
        if (sale.labor_item && sale.labor_item[i].amount_returned > 0) {
          const resp = await transactionStore.addItem({
            description: `Labor for ${
              mechanicStore.getItem(sale.labor_item[i].mechanic)?.name
            } - Sale # ${sale?.id}`,
            amount: sale.labor_item[i].amount_returned,
            transmitter: 10,
            receiver: 14,
            category: 1,
          });
          if (resp.data) payments.push(resp.data.id);
        }
      }

      if (changeAmount > 0) {
        const resp = await transactionStore.addItem({
          description: `Change - Sale # ${sale?.id}`,
          amount: changeAmount - totalAmountReturned,
          transmitter: 10,
          receiver: 14,
          category: 1,
        });

        if (resp.data) payments.push(resp.data.id);
      }

      await saleStore.updateItem(sale.id, {
        status: "3",
        payment: payments,
      });
    };

    const hasAdminStatus = userStore.currentUser.privilege === "1";
    const hasModStatus =
      userStore.currentUser.privilege === "2" ||
      userStore.currentUser.privilege === "1";

    const onPressCheck3 = () => {
      if (!sale?.id) return;
      receivableStore.addItem({
        borrower_name: sale.customer_name ?? "",
        lent_amount: (amount ?? 0) - amountPaid,
        description: `Sale # ${sale.id}`,
        datetime_due: date.toISOString(),
      });
      saleStore.updateItem(sale.id, {
        datetime_closed: new Date().toISOString(),
        is_active: false,
        to_print: false,
      });
    };

    useEffect(() => {
      setGcashAmount("0");
      setCashAmount("");
      setDiscountAmount("0");
    }, [isVisible2]);

    useEffect(() => {
      getPayments();
    }, [sale?.id]);

    return (
      <>
        <MyOverlay
          isVisible={isVisible1}
          setVisible={setVisible1}
          title="Payment Details"
        >
          {sale?.payment
            ?.filter((s) => accountReceiver(s) !== "")
            .map((s) => (
              <HView key={s}>
                <MyText text={accountReceiver(s)} size="medium" />
                <MyText text={toMoney(amountReceived(s) ?? 0)} size="medium" />
              </HView>
            ))}
          <HView hidden={changeAmount < 0}>
            <MyText text="CHANGE" size="medium" />
            <MyText
              text={toMoney(-changeAmount + totalAmountReturned)}
              size="medium"
            />
          </HView>
          <HView hidden={totalAmountReturned <= 0}>
            <MyText text="LABORER" size="medium" />
            <MyText text={toMoney(-totalAmountReturned)} size="medium" />
          </HView>
          <HView hidden={sale?.discount === 0}>
            <MyText text="DISCOUNT" size="medium" />
            <MyText text={toMoney(-(sale?.discount ?? 0))} size="medium" />
          </HView>
          <HView>
            <MyText text="TOTAL" size="medium" highlight />
            <MyText
              text={toMoney(
                totalValue(
                  sale?.payment?.map(
                    (s) =>
                      (accountReceiver(s) === "" ? -1 : 1) *
                      (amountReceived(s) ?? 0)
                  )
                )
              )}
              size="medium"
              highlight
            />
          </HView>
        </MyOverlay>
        <MyOverlay
          isVisible={isVisible2}
          setVisible={setVisible2}
          title="Add Payment"
          onPressCheck={onPressCheck1}
        >
          <HView>
            <MyText size="medium" text="Amount" />
            <MyText size="medium" text={amount ? toMoney(amount) : ""} />
          </HView>
          <MyTextInput
            value={cashAmount}
            onChangeValue={onChangeCashAmount}
            label="Cash"
            numeric
          />
          <MyTextInput
            value={gcashAmount}
            onChangeValue={onChangeGcashAmount}
            label="GCash"
            numeric
          />
          <MyTextInput
            value={discountAmount}
            onChangeValue={onChangeDiscountAmount}
            label="Discount"
            numeric
          />
          <HView hidden={-changeOutput === amount}>
            <MyText size="medium" text="Change" />
            <MyText size="medium" text={toMoney(changeOutput)} />
          </HView>
        </MyOverlay>
        <MyOverlay
          isVisible={isVisible3}
          setVisible={setVisible3}
          title="Process Payment"
          onPressCheck={onPressCheck2}
        >
          <HView>
            <MyText size="medium" text="Amount Paid" />
            <MyText size="medium" text={toMoney(amountPaid)} />
          </HView>
          <HView>
            <MyText size="medium" text="Discount" />
            <MyText
              size="medium"
              text={sale?.discount ? toMoney(sale?.discount) : ""}
            />
          </HView>
          <HView>
            <MyText size="medium" text="Sales Cost" />
            <MyText
              size="medium"
              text={salesTotal ? toMoney(salesTotal) : ""}
            />
          </HView>
          <HView>
            <MyText size="medium" text="Labor Cost" />
            <MyText
              size="medium"
              text={salesTotal ? toMoney(laborTotal) : ""}
            />
          </HView>
          {sale?.labor_item?.map((s) => (
            <HView key={s.id}>
              <MyIcon
                name="star"
                size="small"
                noLabel
                color={
                  s.amount_owed !== s.amount_returned ? "gray" : "goldenrod"
                }
                onPress={() =>
                  onPressStar(
                    s.id,
                    s.amount_owed !== s.amount_returned ? s.amount_owed : 0
                  )
                }
                hidden={s.mechanic === 1}
              />

              <MyText
                size="medium"
                text={`To ${
                  mechanicStore.getItem(s.mechanic)?.name
                } ~ ${toMoney(s.amount_owed - s.amount_returned)}`}
              />
              <MyText size="medium" text={toMoney(s.amount_returned)} />
            </HView>
          ))}
          <HView>
            <MyText size="medium" text="Change" />
            <MyText
              size="medium"
              text={toMoney(changeAmount + totalAmountReturned)}
              error={changeAmount < 0}
            />
          </HView>
          <HView>
            <MyText size="medium" text="To Laborer" />
            <MyText
              size="medium"
              text={toMoney(totalAmountReturned)}
              error={changeAmount < 0}
            />
          </HView>
        </MyOverlay>
        <MyOverlay
          isVisible={isVisible4}
          setVisible={setVisible4}
          title="Create a Receivable"
          onPressCheck={onPressCheck3}
        >
          <HView>
            <MyText size="medium" text="Borrower:" />
            <MyText size="medium" text={sale?.customer_name} />
          </HView>
          <HView>
            <MyText size="medium" text="Amount Due:" />
            <MyText size="medium" text={toMoney((amount ?? 0) - amountPaid)} />
          </HView>
          <HView>
            <MyText size="medium" text="Date to Pay:" />

            <MyDatePicker
              date={date}
              setDate={setDate}
              range="future"
              size="medium"
              noIcon
            />
          </HView>
        </MyOverlay>
        <MyStatusBar
          hidden={hidden}
          amount={amount}
          action1={
            hasModStatus
              ? sale?.status === "2"
                ? {
                    name: "request-quote",
                    onPress: onPressCreateReceivable,
                  }
                : { name: "list", onPress: onPressList }
              : undefined
          }
          action2={{
            name: "print",
            onPress: onPressPrint,
            selected: sale?.to_print,
          }}
          action3={
            sale?.status === "1"
              ? {
                  name: "payments",
                  onPress: onPressPayment,
                }
              : sale?.status === "2"
              ? {
                  name: "undo",
                  onPress: onPressUndo,
                }
              : hasModStatus
              ? {
                  name: "close",
                  onPress: onPressClose,
                }
              : undefined
          }
          action4={
            hasModStatus
              ? sale?.status !== "1"
                ? {
                    name: "star",
                    onPress:
                      sale?.status === "2" ? onPressProcess : onPressUnprocess,
                    selected: sale?.status === "3",
                  }
                : {
                    name: "request-quote",
                    onPress: onPressCreateReceivable,
                  }
              : undefined
          }
          leftText={leftText}
          rightText={rightText}
          leftAction={leftAction}
          rightAction={rightAction}
        />
      </>
    );
  }
);
