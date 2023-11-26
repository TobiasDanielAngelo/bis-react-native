import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { HView } from "../blueprints/HView";
import { MyCard } from "../blueprints/MyCard";
import { MyOverlay } from "../blueprints/MyOverlay";
import { MyText } from "../blueprints/MyText";
import { MyTextInput } from "../blueprints/MyTextInput";
import { doNothing } from "../constants/constants";
import { Product } from "../stores/ProductStore";
import { PurchaseItem } from "../stores/PurchaseItemStore";
import { useStore } from "../stores/Store";
import { toNumString } from "../constants/helpers";

export const PurchaseChosenCard = observer(
  (props: { hidden?: boolean; item: PurchaseItem; locked?: boolean }) => {
    const { item, hidden, locked } = props;

    const { product2Store, sparePartStore, purchaseStore } = useStore();
    const [isVisible1, setVisible1] = useState(false);
    const [value, setValue] = useState("0");

    const product = product2Store.getItem(item.product);

    const similarProducts = product2Store.products.filter(
      (s) =>
        s.part === product?.part &&
        s.description === product.description &&
        s.brand !== "" &&
        s.motors
          .split(", ")
          .filter((t) => product?.motors.split(", ").includes(t)).length > 0
    );

    const onPressClose = () => {
      purchaseStore.deleteItemParticularPurchase(item.purchase, item.id);
    };

    const onChangeValue = (qty: string) => {
      let quantity = toNumString(qty, true);
      setValue(quantity);
    };

    const onPressCheck = () => {
      if (isNaN(parseFloat(value)) || parseFloat(value) === 0 || !product)
        return;
      purchaseStore.updateItemParticularPurchase(
        {
          quantity: parseFloat(value) * product.piece_count,
        },
        item.purchase,
        item.id
      );
    };

    const onPressNone = () => {
      purchaseStore.updateItemParticularPurchase(
        {
          description: toProductShortName(product, true),
          is_valid: false,
        },
        item.purchase,
        item.id
      );
    };

    const onPressAll = () => {
      purchaseStore.updateItemParticularPurchase(
        {
          description: `${toProductShortName(product, true)} ${similarProducts
            .map((s) => s.brand)
            .filter((s) => s !== "")
            .join("/")}`,
          is_valid: false,
        },
        item.purchase,
        item.id
      );
    };

    const onPressBrand = (newId: number) => {
      const newProduct = product2Store.getItem(newId);
      if (!newProduct) return;
      purchaseStore.updateItemParticularPurchase(
        {
          description: toProductShortName(newProduct),
          unit: newProduct.unit,
          purchase_price:
            Math.round(
              100 * (newProduct.purchase_price / newProduct.piece_count)
            ) / 100,
          product: newProduct.id,
          quantity: newProduct.piece_count,
          is_valid: true,
        },
        item.purchase,
        item.id
      );
    };

    const actions = [
      {
        id: 2,
        name: "block",
        position: "Q1",
        onPress: onPressNone,
        disabled: locked,
      },
      {
        id: 3,
        name: "shuffle",
        position: "Q1",
        onPress: onPressAll,
        disabled: locked,
      },
      {
        id: 3,
        name: "edit",
        position: "Q4",
        onPress: () => setVisible1(true),
        disabled: locked,
      },
      {
        id: 4,
        name: "close",
        position: "Q3",
        onPress: onPressClose,
        disabled: locked,
      },
    ];

    const toProductShortName = (t?: Product, noBrand?: boolean) => {
      return !t
        ? ""
        : `${sparePartStore.sparePartName(parseInt(t.part))}${
            t.description !== "" ? " " + t.description : ""
          }${
            t.motors !== "" &&
            sparePartStore.spareParts.find((s) => s.id === parseInt(t.part))
              ?.is_motor_shown
              ? " " + t.motors.split(", ")[0].replaceAll("_", " ")
              : ""
          }${!noBrand && t.brand !== "" ? " " + t.brand : ""}${
            !noBrand
              ? t.is_orig
                ? " ORIG."
                : sparePartStore.spareParts.find(
                    (s) => s.id === parseInt(t.part)
                  )?.is_semi_shown
                ? " SEMI."
                : ""
              : ""
          }`.toUpperCase();
    };

    useEffect(() => {
      if (!product) return;
      setValue(
        (
          Math.round((100 * item.quantity) / product.piece_count) / 100
        ).toString()
      );
    }, [product]);

    return (
      <>
        <MyOverlay
          title="Change Quantity"
          isVisible={isVisible1}
          setVisible={setVisible1}
          onPressCheck={onPressCheck}
        >
          <MyTextInput
            value={value}
            onChangeValue={onChangeValue}
            label={`Qty (in Sets) [1 Set: ${product?.piece_count} ${product?.unit}]`}
            numeric
            centered
          />
          <HView>
            <MyText text="Quantity (per pc)" size="medium" />
            <MyText
              text={
                !isNaN(parseFloat(value))
                  ? parseFloat(value) * (product?.piece_count ?? 1)
                  : ""
              }
              size="medium"
            />
          </HView>
        </MyOverlay>
        <MyCard
          disabled={!item || locked}
          item={item}
          details={[
            {
              id: 1,
              text: item.description,
              type: "main",
            },
          ]}
          price={Math.round(item.purchase_price * item.quantity)}
          quantity={item.quantity}
          unit={`${item.unit}${
            product && product?.piece_count > 1
              ? " = " +
                Math.round((100 * item.quantity) / product.piece_count) / 100 +
                " SET"
              : ""
          }`}
          hidden={hidden}
          actions={actions}
        >
          <HView>
            <MyText
              text={`Other Brands: `}
              size="medium"
              hidden={similarProducts.length === 0}
            />
            {similarProducts.slice(0, 3).map((s) => (
              <MyText
                text={s.brand}
                key={s.id}
                size="medium"
                onPress={() => (locked ? doNothing() : onPressBrand(s.id))}
                success
              />
            ))}
          </HView>
        </MyCard>
      </>
    );
  }
);
