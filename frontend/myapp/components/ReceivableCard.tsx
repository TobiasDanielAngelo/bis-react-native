import { observer } from "mobx-react-lite";
import moment from "moment";
import { useEffect } from "react";
import { MyCard } from "../blueprints/MyCard";
import { toMoney } from "../constants/helpers";
import { Receivable } from "../stores/ReceivableStore";
import { useStore } from "../stores/Store";

export const ReceivableCard = observer(
  (props: { hidden?: boolean; item: Receivable; locked?: boolean }) => {
    const { item, hidden, locked } = props;
    const { transactionStore } = useStore();

    const getPayments = () => {
      let missingIds = [] as number[];
      item.payment?.forEach((s) => {
        if (!transactionStore.getItem(s)) missingIds.push(s);
      });
      if (missingIds.length > 0) transactionStore.fetchSome(missingIds);
    };

    const paymentDetails = item.payment
      .map((s) => transactionStore.getItem(s))
      .map((s) => {
        return {
          id: (s?.id ?? 0) + 3,
          text: `${s?.description} - \u20b1${toMoney(s?.amount ?? 0)} (${moment(
            s?.datetime_transacted
          ).format("MMM D")})`,
          type: "sub",
        };
      });

    useEffect(() => {
      getPayments();
    }, [item.id]);

    return (
      <>
        <MyCard
          disabled={!item.is_active}
          item={item}
          details={[
            {
              id: 1,
              text: `${item.description} - ${item.borrower_name}`,
              type: "main",
            },
            {
              id: 2,
              text: moment(item.datetime_due).format("MMM. D, YYYY, h:mm A"),
              type: "sub",
            },
            {
              id: 3,
              text: `${item.payment.length} payment(s) issued.`,
              type: "sub",
            },
            ...paymentDetails,
          ]}
          price={item.lent_amount}
          hidden={hidden}
        />
      </>
    );
  }
);
