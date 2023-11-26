import { observer } from "mobx-react-lite";
import moment from "moment";
import { useEffect, useState } from "react";
import { MyCard } from "../blueprints/MyCard";
import { totalValue } from "../constants/helpers";
import { SalesItem } from "../stores/SalesItemStore";
import { useStore } from "../stores/Store";

export const ReturnedCard = observer(
  (props: {
    hidden?: boolean;
    item: SalesItem;
    locked?: boolean;
    hasDescription?: boolean;
  }) => {
    const { item, hidden, locked, hasDescription } = props;
    const { saleStore, transactionStore } = useStore();
    const [value, setValue] = useState("");
    const [edit, setEdit] = useState(false);
    const [maxQty, setMaxQty] = useState(1000);

    const saleDetails = saleStore.getItem(item.sales);
    const returnedItems = totalValue(
      saleDetails?.returned_item
        .filter((s) => s.product === item.product)
        .map((s) => s.quantity)
    );

    useEffect(() => {
      if (!saleStore.getItem(item.sales)) {
        saleStore.fetchOne(item.sales);
      }
      setMaxQty(item.quantity - returnedItems);
    }, [item.id]);

    return (
      <>
        <MyCard
          disabled={locked}
          item={item}
          details={[
            {
              id: 1,
              text: `Returned ${returnedItems} / ${item.quantity} ${item.unit}`,
              type: "main",
            },
            {
              id: 2,
              text: item.description,
              type: "sub",
            },
            {
              id: 3,
              text: `Customer Name: ${saleDetails?.customer_name}`,
              type: "sub",
            },
            {
              id: 4,
              text: `Returned: ${moment(item.datetime_added).format(
                "MMM D, h:mm A"
              )}`,
              type: "sub",
            },
          ]}
          quantity={item.quantity}
          unit={item.unit}
          price={-item.selling_price * item.quantity}
          hidden={hidden}
        />
      </>
    );
  }
);
