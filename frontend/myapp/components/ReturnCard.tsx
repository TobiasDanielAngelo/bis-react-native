import { observer } from "mobx-react-lite";
import moment from "moment";
import { useEffect, useState } from "react";
import { MyCard } from "../blueprints/MyCard";
import { MyOverlay } from "../blueprints/MyOverlay";
import { MyTextInput } from "../blueprints/MyTextInput";
import { toNumString, totalValue } from "../constants/helpers";
import { SalesItem } from "../stores/SalesItemStore";
import { useStore } from "../stores/Store";

export const ReturnCard = observer(
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

    const onChangeValue = (qty: string) => {
      let quantity = toNumString(qty);

      if (quantity !== "" && parseInt(quantity) > maxQty) {
        setValue(maxQty.toString());
      } else {
        setValue(quantity);
      }
    };

    const onPressCheck = async () => {
      if (isNaN(parseFloat(value)) || parseFloat(value) === 0) return;
      saleStore.addItemParticularReturn({
        quantity: parseFloat(value),
        selling_price: item.selling_price,
        unit: item.unit,
        description: item.description,
        datetime_added: new Date().toISOString(),
        sales: item.sales,
        product: item.product,
      });
      const resp = await transactionStore.addItem({
        description: `Refund for Sale # ${item.sales} - ${item.product}`,
        amount: item.selling_price * parseFloat(value),
        category: 1,
        transmitter: 10,
        receiver: 14,
      });

      if (!resp.data) return;

      let sale = saleStore.getItem(item.sales);

      if (sale) {
        let payments = sale.payment.slice();
        saleStore.updateItem(sale.id, { payment: [...payments, resp.data.id] });
      }
    };

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
        <MyOverlay
          title="Refund Items"
          isVisible={edit}
          setVisible={setEdit}
          onPressCheck={onPressCheck}
        >
          <MyTextInput
            value={value}
            onChangeValue={onChangeValue}
            label="Quantity"
            numeric
            centered
          />
        </MyOverlay>
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
              id: 3,
              text: `Customer Name: ${saleDetails?.customer_name}`,
              type: "sub",
            },
            {
              id: 4,
              text: `Added: ${moment(item.datetime_added).format(
                "MMM D, h:mm A"
              )}`,
              type: "sub",
            },
          ]}
          actions={
            maxQty > 0
              ? [
                  {
                    id: 1,
                    name: "edit",
                    position: "Q4",
                    onPress: () => setEdit(true),
                  },
                ]
              : []
          }
          quantity={item.quantity}
          unit={item.unit}
          price={item.selling_price * item.quantity}
          hidden={hidden}
        />
      </>
    );
  }
);
