import { observer } from "mobx-react-lite";
import { MyCard } from "../blueprints/MyCard";
import { Account } from "../stores/AccountStore";

export const BalanceCard = observer(
  (props: {
    hidden?: boolean;
    item: Account;
    locked?: boolean;
    hasDescription?: boolean;
  }) => {
    const { item, hidden, locked } = props;

    return (
      <>
        <MyCard
          disabled={locked}
          item={item}
          details={[
            {
              id: 1,
              text: item.name,
              type: "main",
            },
          ]}
          unit={"Balance: "}
          price={(item.received ?? 0) - (item.transmitted ?? 0)}
          hidden={hidden}
        />
      </>
    );
  }
);
