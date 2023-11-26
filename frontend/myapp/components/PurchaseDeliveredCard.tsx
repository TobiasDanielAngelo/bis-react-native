import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { HView } from "../blueprints/HView";
import { MyCard } from "../blueprints/MyCard";
import { MyOverlay } from "../blueprints/MyOverlay";
import { MyText } from "../blueprints/MyText";
import { MyTextInput } from "../blueprints/MyTextInput";
import { roundToCash, toNumString, toNumber } from "../constants/helpers";
import { doNothing } from "../constants/constants";
import { Product } from "../stores/ProductStore";
import { PurchaseItem } from "../stores/PurchaseItemStore";
import { useStore } from "../stores/Store";

export const PurchaseDeliveredCard = observer(
  (props: { hidden?: boolean; item: PurchaseItem; locked?: boolean }) => {
    const { item, hidden, locked } = props;

    const { product2Store, sparePartStore, purchaseStore } = useStore();
    const [isVisible1, setVisible1] = useState(false);
    const [quantity, setQuantity] = useState("0");
    const [details, setDetails] = useState({
      unitPP: "0",
      unitSP: "0",
      packPP: "0",
      packSP: "0",
    });

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

    const onChangeQuantity = (t: string) => {
      setQuantity(toNumString(t, true));
    };

    const onChangeUnitPP = (t: string) => {
      if (!product) return;

      setDetails({
        ...details,
        unitPP: toNumString(t, true),
        packPP: roundToCash(
          toNumber(toNumString(t, true)) * product.piece_count
        ).toString(),
      });
    };

    const onChangePackPP = (t: string) => {
      if (!product) return;
      setDetails({
        ...details,
        packPP: toNumString(t, true),
        unitPP: product.piece_count
          ? roundToCash(
              toNumber(toNumString(t, true)) / product.piece_count
            ).toString()
          : "",
      });
    };

    const onChangeUnitSP = (t: string) => {
      if (!product) return;

      setDetails({
        ...details,
        unitSP: toNumString(t, true),
        packSP: roundToCash(
          toNumber(toNumString(t, true)) * product.piece_count
        ).toString(),
      });
    };

    const onChangePackSP = (t: string) => {
      if (!product) return;

      setDetails({
        ...details,
        packSP: toNumString(t, true),
        unitSP: product.piece_count
          ? roundToCash(
              toNumber(toNumString(t, true)) / product.piece_count
            ).toString()
          : "",
      });
    };
    const onPressCheck = () => {
      if (
        isNaN(parseFloat(quantity)) ||
        parseFloat(quantity) === 0 ||
        !product ||
        toNumber(details.unitPP) === 0 ||
        toNumber(details.unitSP) === 0 ||
        toNumber(details.unitPP) >= toNumber(details.unitSP)
      )
        return;
      purchaseStore.updateItemParticularPurchase(
        {
          quantity: parseFloat(quantity) * product.piece_count,
          purchase_price: roundToCash(
            parseFloat(details.packPP) / product.piece_count
          ),
        },
        item.purchase,
        item.id
      );
      product2Store.updateProduct(product.id, {
        purchase_price: parseFloat(details.packPP),
        sell_price: parseFloat(details.packSP),
      });
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

    const actions = locked
      ? []
      : [
          {
            id: 1,
            name: "warning",
            position: "Q1",
          },
          {
            id: 2,
            name: "edit",
            position: "Q1",
            onPress: () => setVisible1(true),
          },
          {
            id: 2,
            name: "close",
            position: "Q3",
            onPress: onPressClose,
            disabled: locked,
          },
        ].filter((s) => (item.is_valid ? s.id !== 1 : s.id !== 2));

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
      setQuantity(
        (
          Math.round((100 * item.quantity) / product.piece_count) / 100
        ).toString()
      );
      setDetails({
        ...details,
        packPP: product.purchase_price.toString(),
        packSP: product.sell_price.toString(),
        unitPP: roundToCash(
          product.purchase_price / product.piece_count
        ).toString(),
        unitSP: roundToCash(
          product.sell_price / product.piece_count
        ).toString(),
      });
    }, [product]);

    return (
      <>
        <MyOverlay
          title="Edit Product"
          isVisible={isVisible1}
          setVisible={setVisible1}
          onPressCheck={onPressCheck}
        >
          <MyTextInput
            value={quantity}
            onChangeValue={onChangeQuantity}
            label={`Qty (in Sets) [1 Set: ${product?.piece_count} ${product?.unit}]`}
            numeric
            centered
          />
          <HView>
            <MyText
              text={`Quantity (per pc) : ${
                !isNaN(parseFloat(quantity))
                  ? parseFloat(quantity) * (product?.piece_count ?? 1)
                  : ""
              }`}
              size="medium"
            />
          </HView>
          <HView>
            <MyTextInput
              value={details.unitPP}
              onChangeValue={onChangeUnitPP}
              label={`Purchase (1 PC.)`}
              numeric
              centered
              flex={1}
            />
            <MyTextInput
              value={details.packPP}
              onChangeValue={onChangePackPP}
              label={`Purchase (1 Set)`}
              numeric
              centered
              flex={1}
            />
          </HView>
          <HView>
            <MyTextInput
              value={details.unitSP}
              onChangeValue={onChangeUnitSP}
              label={`Selling (1 PC.)`}
              numeric
              centered
              flex={1}
            />
            <MyTextInput
              value={details.packSP}
              onChangeValue={onChangePackSP}
              label={`Selling (1 Set)`}
              numeric
              centered
              flex={1}
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
          <HView hidden={locked}>
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
