import {
  Bills,
  toMoney,
  toNumString,
  totalBillAmt,
} from "../constants/helpers";
import { MyForm } from "./MyForm";
import { MyText } from "./MyText";
import { MyTextInput } from "./MyTextInput";

export const BillsForm = (props: {
  hidden?: boolean;
  noBtn1?: boolean;
  btn1Label?: string;
  bills: Bills;
  setBills: React.Dispatch<React.SetStateAction<Bills>>;
  onPressBtn1?: () => void;
}) => {
  const { hidden, noBtn1, btn1Label, bills, setBills, onPressBtn1 } = props;

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

  return (
    <MyForm
      noBtn1={noBtn1}
      btn1Label={btn1Label}
      noBtn2
      hidden={hidden}
      onPressBtn1={onPressBtn1}
    >
      <MyText
        text={`Bills: \u20b1${toMoney(totalBillAmt(bills))}`}
        size="medium"
        highlight
      />
      <MyTextInput
        label={`\u20b11000`}
        value={bills.b1000}
        onChangeValue={onChangeB1000}
        numeric
        centered
        enlarged
      />
      <MyTextInput
        label={`\u20b1500`}
        value={bills.b500}
        onChangeValue={onChangeB500}
        numeric
        centered
        enlarged
      />
      <MyTextInput
        label={`\u20b1200`}
        value={bills.b200}
        onChangeValue={onChangeB200}
        numeric
        centered
        enlarged
      />
      <MyTextInput
        label={`\u20b1100`}
        value={bills.b100}
        onChangeValue={onChangeB100}
        numeric
        centered
        enlarged
      />
      <MyTextInput
        label={`\u20b150`}
        value={bills.b50}
        onChangeValue={onChangeB50}
        numeric
        centered
        enlarged
      />
      <MyTextInput
        label={`\u20b120`}
        value={bills.b20}
        onChangeValue={onChangeB20}
        numeric
        centered
        enlarged
      />
    </MyForm>
  );
};
