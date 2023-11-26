import { observer } from "mobx-react-lite";
import moment from "moment";
import { MyCard } from "../blueprints/MyCard";
import { useStore } from "../stores/Store";
import { Transaction2 } from "../stores/TransactionStore";

export const ExpenseCard = observer(
  (props: {
    hidden?: boolean;
    item: Transaction2;
    locked?: boolean;
    negative?: boolean;
  }) => {
    const { item, hidden, locked, negative } = props;
    const { accountStore } = useStore();

    const transmitter = accountStore.getItem(item.transmitter);
    const receiver = accountStore.getItem(item.receiver);

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
              text: moment(item.datetime_transacted).format(
                "MMM. D, YYYY, h:mm A"
              ),
              type: "sub",
            },
            {
              id: 3,
              text: negative ? transmitter?.name : "",
              type: "sub",
            },
          ]}
          price={(negative ? -1 : 1) * item.amount}
          hidden={hidden}
        />
      </>
    );
  }
);
