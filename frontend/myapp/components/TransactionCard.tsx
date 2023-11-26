import { observer } from "mobx-react-lite";
import moment from "moment";
import { MyCard } from "../blueprints/MyCard";
import { Transaction } from "../stores/TransactionStore";

export const TransactionCard = observer(
  (props: {
    hidden?: boolean;
    item: Transaction;
    locked?: boolean;
    hasDescription?: boolean;
    negative?: boolean;
  }) => {
    const { item, hidden, locked, negative } = props;

    return (
      <>
        <MyCard
          disabled={locked}
          item={item}
          details={[
            {
              id: 1,
              text: item.description,
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
          unit={" "}
          price={(negative ? -1 : 1) * item.amount}
          hidden={hidden}
        />
      </>
    );
  }
);
