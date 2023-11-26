import { observer } from "mobx-react-lite";
import moment from "moment";
import { MyCard } from "../blueprints/MyCard";
import { useStore } from "../stores/Store";
import { Transaction2 } from "../stores/TransactionStore";

export const TransferCard = observer(
  (props: {
    hidden?: boolean;
    item: Transaction2;
    locked?: boolean;
    hasDescription?: boolean;
  }) => {
    const { item, hidden, locked } = props;
    const { accountStore } = useStore();

    return (
      <>
        <MyCard
          disabled={locked}
          item={item}
          details={[
            {
              id: 1,
              text: `${moment(item.datetime_transacted).format("h:mm A")}`,
              type: "sub",
            },
            {
              id: 2,
              text: `From: ${accountStore.getItem(item.transmitter)?.name}`,
              type: "main",
            },
            {
              id: 3,
              text: `To: ${accountStore.getItem(item.receiver)?.name}`,
              type: "main",
            },
            {
              id: 4,
              text: item.description,
              type: "sub",
            },
          ]}
          price={item.amount}
          hidden={hidden}
        />
      </>
    );
  }
);
