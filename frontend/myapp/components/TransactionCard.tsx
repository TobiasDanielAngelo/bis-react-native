import { observer } from "mobx-react-lite";
import { useState } from "react";
import moment from "moment";
import { MyCard } from "../blueprints/MyCard";
import { Transaction } from "../stores/TransactionStore";
import { MyOverlay } from "../blueprints/MyOverlay";
import { MyTextInput } from "../blueprints/MyTextInput";
import { toNumString } from "../constants/helpers";
import { useStore } from "../stores/Store";

export const TransactionCard = observer(
  (props: {
    hidden?: boolean;
    item: Transaction;
    locked?: boolean;
    noActions?: boolean;
    hasDescription?: boolean;
    negative?: boolean;
  }) => {
    const { item, hidden, locked, negative, noActions } = props;
    const { transactionStore, categoryStore } = useStore();
    const [isVisible1, setVisible1] = useState(false);
    const [value, setValue] = useState(item.amount.toString());

    const onChangeValue = (t: string) => {
      setValue(toNumString(t, true));
    };

    const onPressCheck1 = () => {
      if (isNaN(parseFloat(value))) return;
      transactionStore.updateItem(item.id, { amount: parseFloat(value) });
    };

    return (
      <>
        <MyOverlay
          title="Edit Transaction"
          isVisible={isVisible1}
          setVisible={setVisible1}
          onPressCheck={onPressCheck1}
        >
          <MyTextInput
            label="Amount"
            value={value}
            onChangeValue={onChangeValue}
            centered
            numeric
          />
        </MyOverlay>
        <MyCard
          disabled={locked}
          item={item}
          details={[
            {
              id: 1,
              text: `${categoryStore.getItem(item.category)?.title} - ${
                item.description
              }`,
              type: "main",
            },
            {
              id: 2,
              text: `${moment(item.datetime_transacted).format(
                "MMM D, h:mm A"
              )}`,
              type: "sub",
            },
          ]}
          actions={
            [2].includes(item.category)
              ? []
              : [
                  {
                    id: 1,
                    name: "edit",
                    position: "Q4",
                    onPress: () => setVisible1(true),
                  },
                ]
          }
          unit={" "}
          price={(negative ? -1 : 1) * item.amount}
          hidden={hidden}
        />
      </>
    );
  }
);
