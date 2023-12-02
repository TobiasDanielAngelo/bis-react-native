import { MyDropdownPicker } from "../blueprints/MyDropdownPicker";
import { MyForm } from "../blueprints/MyForm";
import { useState, useEffect } from "react";
import { useStore } from "../stores/Store";
import { MyIcon } from "../blueprints/MyIcon";
import { HView } from "../blueprints/HView";
import { MyTextInput } from "../blueprints/MyTextInput";
import { toNumString, toNumber, totalValue } from "../constants/helpers";
import { MyText } from "../blueprints/MyText";
import { MyDatePicker } from "../blueprints/MyDatePicker";

const defaultDetails = {
  comment: "",
  category: -1,
  transmitter: 10,
  receiver: 16,
  person: "",
  amount: "",
  receivable: -1,
};

export const IncomeForm = (props: { hidden?: boolean }) => {
  const { hidden } = props;
  const [details, setDetails] = useState(defaultDetails);

  const { categoryStore, accountStore, receivableStore, transactionStore } =
    useStore();

  const noBtn =
    details.receivable === -1 ||
    isNaN(parseFloat(details.amount)) ||
    details.category === -1 ||
    details.transmitter === -1;

  const categories = categoryStore.categories.filter((s) => s.nature === "2");

  const accounts = accountStore.accounts.filter(
    (s) => ![14, 16].includes(s.id)
  );

  const receivables = receivableStore.receivables.filter((s) => s.is_active);

  const receivable = receivables.find((s) => s.id === details.receivable);

  const totalPaymentReceived = () =>
    totalValue(
      receivable?.payment.map((s) => transactionStore.getItem(s)?.amount ?? 0)
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
      transmitter: 16,
      receiver: details.receiver,
    });
    if (resp.data && details.receivable !== -1) {
      await receivableStore.updateItem(details.receivable, {
        payment: [...(receivable?.payment ?? []), resp.data.id],
      });
    }
    if ((receivable?.lent_amount ?? 0) <= totalPaymentReceived()) {
      await receivableStore.updateItem(details.receivable, {
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
    if (details.receivable !== -1) {
      setDetails({
        ...details,
        comment: `Payment for ${receivable?.description}`,
        category: 8,
        transmitter: 16,
        receiver: 10,
        person: receivable?.borrower_name ?? "",
        amount:
          (
            (receivable?.lent_amount ?? 0) - totalPaymentReceived()
          ).toString() ?? "",
      });
    } else {
      setDetails({
        ...details,
        comment: "",
        category: -1,
        transmitter: 16,
        receiver: 10,
        person: "",
        amount: "",
      });
    }
  }, [details.receivable]);

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
          value={details.receiver}
          setValue={(t) => setDetails({ ...details, transmitter: t })}
          label={"To this Account"}
          flex
        />
      </HView>
      <HView>
        <MyTextInput
          label={"Comment (Optional)"}
          value={details.comment}
          onChangeValue={(t) => setDetails({ ...details, comment: t })}
          flex={5}
          centered
        />
        <MyTextInput
          label={"Payee"}
          value={details.person}
          onChangeValue={(t) => setDetails({ ...details, person: t })}
          flex={3}
        />
      </HView>
      <MyDropdownPicker
        items={[
          { value: -1, label: "No Receivable Attachment." },
          ...receivables.map((s) => ({
            value: s.id,
            label: `${s.borrower_name} - ${s.description}`,
          })),
        ]}
        value={details.receivable}
        setValue={(t) => setDetails({ ...details, receivable: t })}
        label="Attach a Receivable"
      />
    </MyForm>
  );
};
