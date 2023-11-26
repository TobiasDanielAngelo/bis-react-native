import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { HView } from "../blueprints/HView";
import { ModesBar } from "../blueprints/ModesBar";
import { MyDatePicker } from "../blueprints/MyDatePicker";
import { MyDropdownPicker } from "../blueprints/MyDropdownPicker";
import { MyForm } from "../blueprints/MyForm";
import { MyIcon } from "../blueprints/MyIcon";
import { MyText } from "../blueprints/MyText";
import { MyTextInput } from "../blueprints/MyTextInput";
import { toNumString, totalValue } from "../constants/helpers";
import { accountStore } from "../stores/AccountStore";
import { useStore } from "../stores/Store";

const defaultDetails = {
  comment: "",
  category: -1,
  transmitter: 10,
  receiver: 16,
  person: "",
  amount: "",
  date_due: new Date(),
  payable: -1,
  receivable: -1,
};

export const B1QuickView = observer((props: { isVisible?: boolean }) => {
  const { isVisible } = props;

  const {
    categoryStore,
    payableStore,
    receivableStore,
    transactionStore,
    userStore,
  } = useStore();

  const [mode, setMode] = useState(0);
  const [details, setDetails] = useState(defaultDetails);

  const categories = categoryStore.categories
    .filter((s) => s.nature !== "3" && s.nature !== "2")
    .filter((s) => (mode === 2 ? s.nature === "5" : s.nature !== "5"));

  const accounts = accountStore.accounts.filter(
    (s) => ![11, 14, 16].includes(s.id)
  );

  const payables = payableStore.payables.filter((s) => s.is_active);

  const payable = payables.find((s) => s.id === details.payable);

  const totalPayment = () =>
    totalValue(
      payable?.payment.map((s) => transactionStore.getItem(s)?.amount ?? 0)
    );

  const receivables = receivableStore.receivables.filter((s) => s.is_active);

  const receivable = receivables.find((s) => s.id === details.receivable);

  const totalPaymentReceived = () =>
    totalValue(
      receivable?.payment.map((s) => transactionStore.getItem(s)?.amount ?? 0)
    );

  const noBtn =
    isNaN(parseFloat(details.amount)) ||
    (mode !== 3 && details.category === -1) ||
    ((mode === 1 || mode === 4) &&
      (details.category === 50 || details.category === 51) &&
      details.payable === -1 &&
      details.receivable === -1) ||
    ((mode === 2 || mode === 3) &&
      (details.comment === "" || details.person === ""));

  const onPressBtn1 = async () => {
    switch (mode) {
      case 1:
        const resp = await transactionStore.addItem({
          description:
            details.comment === "" && details.person === ""
              ? categoryStore.getItem(details.category)?.title ??
                `Cat-${details.category}`
              : `${details.comment} (${details.person})`,
          amount: parseFloat(details.amount),
          category: details.category,
          transmitter: details.transmitter,
          receiver: 16,
        });
        if (resp.data && details.payable !== -1) {
          await payableStore.updateItem(details.payable, {
            payment: [...(payable?.payment ?? []), resp.data.id],
          });
        }
        if ((payable?.borrowed_amount ?? 0) <= totalPayment()) {
          payableStore.updateItem(details.payable, {
            is_active: false,
            datetime_closed: new Date().toISOString(),
          });
        }
        break;
      case 2:
        transactionStore.addItem({
          description:
            details.comment === "" && details.person === ""
              ? categoryStore.getItem(details.category)?.title ??
                `Cat-${details.category}`
              : `${details.comment} (${details.person})`,
          amount: parseFloat(details.amount),
          category: details.category,
          transmitter: details.transmitter,
          receiver: 16,
        });
        receivableStore.addItem({
          borrower_name: details.person,
          lent_amount: parseFloat(details.amount),
          description: details.comment,
          datetime_due: details.date_due.toISOString(),
        });
        break;
      case 3:
        payableStore.addItem({
          lender_name: details.person,
          borrowed_amount: parseFloat(details.amount),
          description: details.comment,
          datetime_due: details.date_due.toISOString(),
        });
        break;
      case 4:
        const resp2 = await transactionStore.addItem({
          description:
            details.comment === "" && details.person === ""
              ? categoryStore.getItem(details.category)?.title ??
                `Cat-${details.category}`
              : `${details.comment} (${details.person})`,
          amount: parseFloat(details.amount),
          category: details.category,
          transmitter: 16,
          receiver: details.receiver,
        });
        if (resp2.data && details.receivable !== -1) {
          await receivableStore.updateItem(details.receivable, {
            payment: [...(receivable?.payment ?? []), resp2.data.id],
          });
        }

        if ((receivable?.lent_amount ?? 0) <= totalPaymentReceived()) {
          receivableStore.updateItem(details.receivable, {
            is_active: false,
            datetime_closed: new Date().toISOString(),
          });
        }
        break;
      default:
        break;
    }
    setMode(0);
  };

  useEffect(() => {
    if (mode === 1) {
      setDetails({
        ...details,
        transmitter: 10,
        comment: "",
        category: -1,
        person: "",
        payable: -1,
        receivable: -1,
        amount: "",
      });
    } else if (mode === 2) {
      setDetails({
        ...details,
        transmitter: 10,
        category: 2,
        comment: "",
        person: "",
        payable: -1,
        receivable: -1,
        amount: "",
      });
    } else if (mode === 3) {
      setDetails({
        ...details,
        transmitter: 1,
        comment: "Receipt #",
        category: -1,
        person: "",
        payable: -1,
        receivable: -1,
        amount: "",
      });
    } else if (mode === 4) {
      setDetails({
        ...details,
        transmitter: 16,
        receiver: 10,
        comment: "",
        category: 51,
        person: "",
        payable: -1,
        receivable: -1,
        amount: "",
      });
    } else {
      setDetails(defaultDetails);
    }
  }, [mode]);

  const onPressRefresh = () => {
    payableStore.fetchAll({ isActive: true });
    receivableStore.fetchAll({ isActive: true });
    transactionStore.fetchAll();
  };

  useEffect(() => {
    if (details.payable !== -1) {
      setDetails({
        ...details,
        comment: "Check #",
        category: -1,
        transmitter: 1,
        receiver: 16,
        person: payable?.lender_name ?? "",
        amount:
          ((payable?.borrowed_amount ?? 0) - totalPayment()).toString() ?? "",
        date_due: new Date(),
        receivable: -1,
      });
    }
    if (details.receivable !== -1) {
      setDetails({
        ...details,
        comment: `Payment for ${receivable?.description}` ?? "",
        category: 8,
        transmitter: 16,
        receiver: 10,
        person: receivable?.borrower_name ?? "",
        amount:
          (
            (receivable?.lent_amount ?? 0) - totalPaymentReceived()
          ).toString() ?? "",
        date_due: new Date(),
        payable: -1,
      });
    }
  }, [details.payable, details.receivable]);

  return (
    isVisible && (
      <View style={styles.main}>
        <ModesBar
          actions={[
            { id: 1, name: "add", label: "Expense" },
            { id: 2, name: "request-quote", label: "Receivable" },
            { id: 3, name: "credit-card", label: "Payable" },
            { id: 4, name: "add", label: "Income etc." },
          ]}
          mode={mode}
          setMode={setMode}
          onPressClear={() => setDetails(defaultDetails)}
        />
        <View style={styles.body}>
          <MyForm
            hidden={mode === 0}
            noBtn1={noBtn}
            noBtn2={noBtn}
            onPressBtn1={onPressBtn1}
            onPressBtn2={() => setMode(0)}
          >
            <MyDropdownPicker
              items={categories.map((s) => ({
                value: s.id,
                label: s.title,
                icon: () => <MyIcon name={s.logo} noLabel />,
              }))}
              value={details.category}
              setValue={(t) => setDetails({ ...details, category: t })}
              label="Category"
              hidden={mode !== 1}
            />
            <HView>
              <MyTextInput
                label="Amount"
                value={details.amount}
                onChangeValue={(t) =>
                  setDetails({ ...details, amount: toNumString(t) })
                }
                numeric
                centered
                flex={mode === 3 ? 1 : 0.7}
              />
              <MyDropdownPicker
                items={accounts.map((s) => ({
                  value: s.id,
                  label: s.name,
                }))}
                value={mode === 4 ? details.receiver : details.transmitter}
                setValue={(t) =>
                  mode === 4
                    ? setDetails({ ...details, receiver: t })
                    : setDetails({ ...details, transmitter: t })
                }
                label={mode !== 4 ? "From this Account" : "To this Account"}
                flex
                hidden={mode === 3}
              />
            </HView>
            <HView>
              <MyTextInput
                label={
                  mode === 1
                    ? "Comment (Optional)"
                    : mode === 2 || mode === 4
                    ? "Purpose"
                    : "Receipt #"
                }
                value={details.comment}
                onChangeValue={(t) => setDetails({ ...details, comment: t })}
                flex={5}
                numeric={mode === 3}
                centered={mode === 3}
              />
              <MyTextInput
                label={
                  mode === 1
                    ? "Spender (Opt)"
                    : mode === 2
                    ? "Borrower"
                    : mode === 3
                    ? "Lender"
                    : "Payee"
                }
                value={details.person}
                onChangeValue={(t) => setDetails({ ...details, person: t })}
                flex={3}
              />
            </HView>
            <HView hidden={mode === 1 || mode === 4}>
              <MyText text="Due date:" size="medium" />
              <MyDatePicker
                date={details.date_due}
                setDate={(t) => setDetails({ ...details, date_due: t })}
                range="future"
                size="small"
                noIcon
              />
            </HView>
            <MyDropdownPicker
              items={payables.map((s) => ({
                value: s.id,
                label: `${s.lender_name} - ${s.description}`,
              }))}
              value={details.payable}
              setValue={(t) => setDetails({ ...details, payable: t })}
              label="Attach a Payable"
              hidden={details.category !== 50}
            />
            <MyDropdownPicker
              items={receivables.map((s) => ({
                value: s.id,
                label: `${s.borrower_name} - ${s.description} - ${s.lent_amount}`,
              }))}
              value={details.receivable}
              setValue={(t) => setDetails({ ...details, receivable: t })}
              label="Attach a Receivable"
              hidden={details.category !== 51}
            />
          </MyForm>
          {/* <MyStatusBar action1={{ name: "refresh", onPress: onPressRefresh }} /> */}
        </View>
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
  },
});
