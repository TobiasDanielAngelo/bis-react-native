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
  person: "",
  amount: "",
  date_due: new Date(),
};

export const PayableForm = (props: { hidden?: boolean }) => {
  const { hidden } = props;
  const [details, setDetails] = useState(defaultDetails);

  const { payableStore } = useStore();

  const noBtn =
    isNaN(parseFloat(details.amount)) ||
    details.person === "" ||
    details.comment === "";

  const onPressSubmit = () => {
    payableStore.addItem({
      lender_name: details.person,
      borrowed_amount: parseFloat(details.amount),
      description: details.comment,
      datetime_due: details.date_due.toISOString(),
    });
    setDetails(defaultDetails);
  };

  const onPressCancel = () => {
    setDetails(defaultDetails);
  };

  return (
    <MyForm
      hidden={hidden}
      noBtn1={noBtn}
      noBtn2={noBtn}
      onPressBtn1={onPressSubmit}
      onPressBtn2={onPressCancel}
    >
      <HView>
        <MyText text="Agreed Due Date:" size="medium" />
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
      <HView>
        <MyTextInput
          label={"Receipt #"}
          value={details.comment}
          onChangeValue={(t) => setDetails({ ...details, comment: t })}
          flex={1}
        />
        <MyTextInput
          label={"Lender/Supplier"}
          value={details.person}
          onChangeValue={(t) => setDetails({ ...details, person: t })}
          flex={1}
        />
      </HView>
    </MyForm>
  );
};
