import { observer } from "mobx-react-lite";
import { useState } from "react";
import { MyCard } from "../blueprints/MyCard";
import { Product } from "../stores/ProductStore";
import { purchaseStore } from "../stores/PurchaseStore";
import { useStore } from "../stores/Store";
import { MyOverlay } from "../blueprints/MyOverlay";
import { MyTextInput } from "../blueprints/MyTextInput";
import { toNumString, toProductShortName } from "../constants/helpers";

export const PurchasePickCard = observer(
  (props: {
    hidden?: boolean;
    item: Product;
    locked?: boolean;
    purchaseId: number;
  }) => {
    const { item, hidden, locked, purchaseId } = props;
    const [isVisible1, setVisible1] = useState(false);
    const [minQuantity, setMinQuantity] = useState(
      item.min_quantity.toString()
    );

    const { sparePartStore, purchaseItemStore, productStore } = useStore();

    const onPressAdd = () => {
      purchaseStore.addItemParticularPurchase({
        description: toProductShortName(sparePartStore, item),
        unit: item.unit,
        purchase_price:
          Math.round(100 * (item.purchase_price / item.piece_count)) / 100,
        product: item.id,
        purchase: purchaseId,
        quantity: item.piece_count,
      });
    };

    const onPressRefresh = () => {
      productStore.fetchProducts({ ids: [item.id] });
    };

    const onChangeMinQuantity = (t: string) => {
      setMinQuantity(toNumString(t));
    };

    const onPressCheck = () => {
      if (isNaN(parseFloat(minQuantity))) return;
      productStore.updateProduct(item.id, {
        min_quantity: parseInt(minQuantity),
      });
    };
    const similarProducts = productStore.products.filter(
      (s) =>
        s.part === item.part &&
        s.description === item.description &&
        s.id !== item.id &&
        s.motors.split(", ").filter((t) => item.motors.split(", ").includes(t))
          .length > 0
    );

    const actions = [
      { id: 1, name: "add", position: "Q6", onPress: onPressAdd },
      { id: 2, name: "refresh", position: "Q4", onPress: onPressRefresh },
      { id: 3, name: "edit", position: "Q4", onPress: () => setVisible1(true) },
    ].filter((s) => (locked ? s.id !== 1 : s));

    return (
      <>
        <MyOverlay
          isVisible={isVisible1}
          setVisible={setVisible1}
          title="Edit Minimum Sets"
          onPressCheck={onPressCheck}
        >
          <MyTextInput
            label="Minimum Quantity (Set)"
            value={minQuantity}
            onChangeValue={onChangeMinQuantity}
            numeric
            centered
          />
        </MyOverlay>
        <MyCard
          disabled={!item.is_active}
          item={item}
          details={[
            {
              id: 1,
              text: toProductShortName(sparePartStore, item),
              type: "main",
            },
            {
              id: 2,
              text: `${
                item.motors !== ""
                  ? "For " + item.motors.replaceAll("_", " ")
                  : ""
              }`,
              type: "sub",
            },
            {
              id: 3,
              text: `In stock: ${Math.floor(
                (item.purchased - item.sold + item.returned + item.counted) /
                  item.piece_count
              )} ${item.piece_count > 1 ? "SET(S)" : item.unit} (Minimum of ${
                item.min_quantity
              } ${item.piece_count > 1 ? "SET(S)" : item.unit})`,
              type: "sub",
            },
            {
              id: 4,
              text: `Pieces per Package/Set: ${item.piece_count} ${item.unit}`,
              type: "sub",
            },
            {
              id: 5,
              text:
                similarProducts.length > 0
                  ? `Other Brands: ${similarProducts
                      .map((s) => s.brand)
                      .join(", ")}`
                  : "",
              type: "sub",
            },
          ]}
          price={item.purchase_price}
          hidden={hidden}
          actions={actions}
        />
      </>
    );
  }
);
