import { observer } from "mobx-react-lite";
import { MyCard } from "../blueprints/MyCard";
import { Product } from "../stores/ProductStore";
import { purchaseStore } from "../stores/PurchaseStore";
import { useStore } from "../stores/Store";

export const PurchasePickCard = observer(
  (props: {
    hidden?: boolean;
    item: Product;
    locked?: boolean;
    purchaseId: number;
  }) => {
    const { item, hidden, locked, purchaseId } = props;

    const { sparePartStore, purchaseItemStore, productStore } = useStore();

    const toProductShortName = (t: Product) => {
      return `${sparePartStore.sparePartName(t.part)}${
        t.description !== "" ? " " + t.description : ""
      }${
        t.motors !== "" &&
        sparePartStore.spareParts.find((s) => s.id === t.part)?.is_motor_shown
          ? " " + t.motors.split(", ")[0].replaceAll("_", " ")
          : ""
      }${t.brand !== "" ? " " + t.brand : ""}${
        t.is_orig
          ? " ORIG."
          : sparePartStore.spareParts.find((s) => s.id === t.part)
              ?.is_semi_shown
          ? " SEMI."
          : ""
      }`.toUpperCase();
    };

    const onPressAdd = () => {
      purchaseStore.addItemParticularPurchase({
        description: toProductShortName(item),
        unit: item.unit,
        purchase_price:
          Math.round(100 * (item.purchase_price / item.piece_count)) / 100,
        product: item.id,
        purchase: purchaseId,
        quantity: item.piece_count,
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
    ].filter((s) => (locked ? s.id !== 1 : s));

    return (
      <>
        <MyCard
          disabled={!item.is_active}
          item={item}
          details={[
            {
              id: 1,
              text: toProductShortName(item),
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
              text: `${item.piece_count} ${item.unit}`,
              type: "sub",
            },
            {
              id: 4,
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
