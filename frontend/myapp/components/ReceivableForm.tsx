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

export const ReceivableForm = (props: { hidden?: boolean }) => {
  const { hidden } = props;
  const defaultDetails = {
    comment: "",
    transmitter: 10,
    receiver: 16,
    person: "",
    amount: "",
    date_due: new Date(),
  };
  const [details, setDetails] = useState(defaultDetails);

  const { accountStore, receivableStore, transactionStore } = useStore();

  const noBtn =
    isNaN(parseFloat(details.amount)) ||
    details.person === "" ||
    details.comment === "" ||
    details.transmitter === -1;

  const onPressSubmit = () => {
    transactionStore.addItem({
      description:
        details.comment === "" && details.person === ""
          ? `Lend Money to Anon.`
          : `${details.comment.toUpperCase()} (${details.person.toUpperCase()})`,
      amount: parseFloat(details.amount),
      category: 2,
      transmitter: details.transmitter,
      receiver: 16,
    });
    receivableStore.addItem({
      borrower_name: details.person.toUpperCase(),
      lent_amount: parseFloat(details.amount),
      description: details.comment.toUpperCase(),
      datetime_due: details.date_due.toISOString(),
    });
    setDetails(defaultDetails);
  };

  const onPressCancel = () => {
    setDetails(defaultDetails);
  };

  const accounts = accountStore.accounts.filter(
    (s) => ![14, 16].includes(s.id)
  );

  return (
    <MyForm
      hidden={hidden}
      noBtn1={noBtn}
      noBtn2={noBtn}
      onPressBtn1={onPressSubmit}
      onPressBtn2={onPressCancel}
    >
      <HView>
        <MyText text="Expected Due Date:" size="medium" />
        <MyDatePicker
          date={details.date_due}
          setDate={(t) => setDetails({ ...details, date_due: t })}
          range="future"
          size="small"
          noIcon
        />
      </HView>
      <MyTextInput
        label="Amount"
        value={details.amount}
        onChangeValue={(t) =>
          setDetails({ ...details, amount: toNumString(t, true) })
        }
        numeric
        centered
      />
      <MyDropdownPicker
        items={accounts.map((s) => ({
          value: s.id,
          label: s.name,
        }))}
        value={details.transmitter}
        setValue={(t) => setDetails({ ...details, transmitter: t })}
        label={"Get from this Account"}
        flex
      />
      <HView>
        <MyTextInput
          label={"Purpose"}
          value={details.comment}
          onChangeValue={(t) => setDetails({ ...details, comment: t })}
          flex={5}
        />
        <MyTextInput
          label={"Borrower"}
          value={details.person}
          onChangeValue={(t) => setDetails({ ...details, person: t })}
          flex={3}
        />
      </HView>
    </MyForm>
  );
};
