import { MyDropdownPicker } from "../blueprints/MyDropdownPicker";
import { MyForm } from "../blueprints/MyForm";
import { useState, useEffect } from "react";
import { useStore } from "../stores/Store";
import { MyIcon } from "../blueprints/MyIcon";
import { HView } from "../blueprints/HView";
import { MyTextInput } from "../blueprints/MyTextInput";
import { toNumString, totalValue } from "../constants/helpers";
import { MyText } from "../blueprints/MyText";
import { MyDatePicker } from "../blueprints/MyDatePicker";

const defaultDetails = {
  comment: "",
  category: -1,
  transmitter: 10,
  person: "",
  amount: "",
  date_due: new Date(),
  payable: -1,
};

export const ExpenseForm = (props: { hidden?: boolean }) => {
  const { hidden } = props;
  const [details, setDetails] = useState(defaultDetails);

  const { categoryStore, accountStore, payableStore, transactionStore } =
    useStore();

  const noBtn =
    isNaN(parseFloat(details.amount)) ||
    details.category === -1 ||
    details.transmitter === -1;

  const categories = categoryStore.categories.filter(
    (s) => s.nature !== "3" && s.nature !== "2" && ![2, 50, 51].includes(s.id)
  );

  const accounts = accountStore.accounts.filter(
    (s) => ![14, 16, 19].includes(s.id)
  );

  const payables = payableStore.payables.filter((s) => s.is_active);

  const payable = payables.find((s) => s.id === details.payable);

  const totalPayment = () =>
    totalValue(
      payable?.payment.map((s) => transactionStore.getItem(s)?.amount ?? 0)
    );

  const onPressSubmit = async () => {
    const resp = await transactionStore.addItem({
      description:
        details.comment === "" && details.person === ""
          ? categoryStore.getItem(details.category)?.title ??
            `Cat-${details.category}`
          : `${details.comment.toUpperCase()} (${details.person.toUpperCase()})`,
      amount: parseFloat(details.amount),
      category: details.category,
      transmitter: details.transmitter,
      receiver: 16,
      datetime_transacted: details.date_due.toISOString(),
    });
    if (resp.data && details.payable !== -1) {
      await payableStore.updateItem(details.payable, {
        payment: [...(payable?.payment ?? []), resp.data.id],
      });
    }
    if (
      (payable?.borrowed_amount ?? 0) <= totalPayment() &&
      details.payable !== -1
    ) {
      await payableStore.updateItem(details.payable, {
        is_active: false,
        datetime_closed: new Date().toISOString(),
      });
    }
    setDetails(defaultDetails);
  };

  const onPressCancel = () => {
    setDetails(defaultDetails);
  };

  useEffect(() => {
    if (details.payable !== -1) {
      setDetails({
        ...details,
        comment: "Check #",
        category: -1,
        transmitter: 1,
        person: payable?.lender_name ?? "",
        amount:
          ((payable?.borrowed_amount ?? 0) - totalPayment()).toString() ?? "",
        date_due: new Date(payable?.datetime_due ?? new Date()),
      });
    } else {
      setDetails({
        ...details,
        comment: "",
        category: -1,
        transmitter: 10,
        person: "",
        amount: "",
        date_due: new Date(),
      });
    }
  }, [details.payable]);

  return (
    <MyForm
      hidden={hidden}
      noBtn1={noBtn}
      noBtn2={noBtn}
      onPressBtn1={onPressSubmit}
      onPressBtn2={onPressCancel}
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
      />
      <HView>
        <MyTextInput
          label="Amount"
          value={details.amount}
          onChangeValue={(t) =>
            setDetails({ ...details, amount: toNumString(t, true) })
          }
          numeric
          centered
          flex={1}
        />
        <MyDropdownPicker
          items={accounts.map((s) => ({
            value: s.id,
            label: s.name,
          }))}
          value={details.transmitter}
          setValue={(t) => setDetails({ ...details, transmitter: t })}
          label={"From this Account"}
          flex
        />
      </HView>
      <HView>
        <MyTextInput
          label={"Comment"}
          value={details.comment}
          onChangeValue={(t) => setDetails({ ...details, comment: t })}
          flex={5}
          centered
        />
        <MyTextInput
          label={"Spender"}
          value={details.person}
          onChangeValue={(t) => setDetails({ ...details, person: t })}
          flex={3}
        />
      </HView>
      <MyDropdownPicker
        items={[
          { value: -1, label: "No Payable Attachment." },
          ...payables.map((s) => ({
            value: s.id,
            label: `${s.lender_name} - ${s.description}`,
          })),
        ]}
        value={details.payable}
        setValue={(t) => setDetails({ ...details, payable: t })}
        label="Attach a Payable"
      />
      <HView hidden={details.payable === -1}>
        <MyText text="Date Posted:" size="medium" />
        <MyDatePicker
          date={details.date_due}
          setDate={(t) => setDetails({ ...details, date_due: t })}
          range="future"
          size="small"
          noIcon
        />
      </HView>
    </MyForm>
  );
};
