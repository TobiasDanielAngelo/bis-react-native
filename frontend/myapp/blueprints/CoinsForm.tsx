import {
  Bills,
  Coins,
  toMoney,
  toNumString,
  totalBillAmt,
  totalCoinAmt,
} from "../constants/helpers";
import { MyForm } from "./MyForm";
import { MyText } from "./MyText";
import { MyTextInput } from "./MyTextInput";

export const CoinsForm = (props: {
  hidden?: boolean;
  noBtn1?: boolean;
  btn1Label?: string;
  coins: Coins;
  setCoins: React.Dispatch<React.SetStateAction<Coins>>;
  onPressBtn1?: () => void;
}) => {
  const { hidden, noBtn1, btn1Label, coins, setCoins, onPressBtn1 } = props;

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

  return (
    <MyForm
      noBtn1={noBtn1}
      btn1Label={btn1Label}
      noBtn2
      hidden={hidden}
      onPressBtn1={onPressBtn1}
    >
      <MyText
        text={`Coins: \u20b1${toMoney(totalCoinAmt(coins))}`}
        size="medium"
        highlight
      />
      <MyTextInput
        label={`\u20b120`}
        value={coins.c20}
        onChangeValue={onChangeC20}
        numeric
        centered
        enlarged
      />
      <MyTextInput
        label={`\u20b110`}
        value={coins.c10}
        onChangeValue={onChangeC10}
        numeric
        centered
        enlarged
      />
      <MyTextInput
        label={`\u20b15`}
        value={coins.c5}
        onChangeValue={onChangeC5}
        numeric
        centered
        enlarged
      />
      <MyTextInput
        label={`\u20b11`}
        value={coins.c1}
        onChangeValue={onChangeC1}
        numeric
        centered
        enlarged
      />
    </MyForm>
  );
};
