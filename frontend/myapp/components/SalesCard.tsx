import { observer } from "mobx-react-lite";
import { useState } from "react";
import { MyCard } from "../blueprints/MyCard";
import { MyOverlay } from "../blueprints/MyOverlay";
import { MyTextInput } from "../blueprints/MyTextInput";
import { toNumString } from "../constants/helpers";
import { SalesItem } from "../stores/SalesItemStore";
import { useStore } from "../stores/Store";

export const SalesCard = observer(
  (props: {
    hidden?: boolean;
    item: SalesItem;
    locked?: boolean;
    noActions?: boolean;
  }) => {
    const { item, hidden, locked, noActions } = props;
    const { saleStore } = useStore();
    const [value, setValue] = useState(item.quantity.toString());
    const [edit, setEdit] = useState(false);
    const [maxQty, setMaxQty] = useState(1000);
    const [isDecimal, setDecimal] = useState(false);

    const onChangeValue = (qty: string) => {
      let quantity = toNumString(qty, isDecimal);

      if (quantity !== "" && maxQty && parseInt(quantity) > maxQty) {
        setValue(maxQty.toString());
      } else {
        setValue(quantity);
      }
    };

    const onPressCheck = async () => {
      if (isNaN(parseFloat(value))) return;
      if (parseFloat(value) === 0) {
        onPressClose();
        return;
      }
      await saleStore.updateItemParticularSale(
        { quantity: parseFloat(value) },
        item.sales,
        item.id
      );
    };

    const onPressStar = async () => {
      await saleStore.updateItemParticularSale(
        { is_claimed: !item.is_claimed },
        item.sales,
        item.id
      );
    };

    const onPressClose = async () => {
      await saleStore.deleteItemParticularSale(item.sales, item.id);
    };

    return (
      <>
        <MyOverlay
          title="Edit Quantity"
          isVisible={edit}
          setVisible={setEdit}
          onPressCheck={onPressCheck}
          actionLogo1={isDecimal ? "circle" : "pie-chart"}
          onPressAction1={() => setDecimal((t) => !t)}
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
            { id: 1, text: item.description, type: "main" },
            { id: 2, text: `SKU # ${item.product}`, type: "sub" },
          ]}
          price={item.selling_price * item.quantity}
          hidden={hidden}
          actions={
            !noActions
              ? [
                  {
                    id: 1,
                    name: "star",
                    position: "Q5",
                    onPress: onPressStar,
                    color: item.is_claimed ? "goldenrod" : "gray",
                  },
                  {
                    id: 2,
                    name: "edit",
                    position: "Q4",
                    onPress: () => !locked && setEdit((t) => !t),
                  },
                  {
                    id: 4,
                    name: "close",
                    position: "Q6",
                    onPress: () => !locked && onPressClose(),
                  },
                ]
              : []
          }
          quantity={item.quantity}
          unit={item.unit}
        />
      </>
    );
  }
);
