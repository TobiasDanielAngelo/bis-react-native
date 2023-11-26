import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { HView } from "../blueprints/HView";
import { MyDatePicker } from "../blueprints/MyDatePicker";
import { MyDotPager } from "../blueprints/MyDotPager";
import { MyDropdownPicker } from "../blueprints/MyDropdownPicker";
import { MyIcon } from "../blueprints/MyIcon";
import { MyList } from "../blueprints/MyList";
import { MyOverlay } from "../blueprints/MyOverlay";
import { MyStatusBar } from "../blueprints/MyStatusBar";
import { MyText } from "../blueprints/MyText";
import { MyTextInput } from "../blueprints/MyTextInput";
import { SearchBar } from "../blueprints/SearchBar";
import { SearchResultList } from "../blueprints/SearchResultList";
import { PurchaseDeliveredCard } from "../components/PurchaseDeliveredCard";
import {
  toMoney,
  toNumString,
  toNumber,
  totalValue,
} from "../constants/helpers";
import { useStore } from "../stores/Store";
import { Product } from "../stores/ProductStore";

const defaultDetails = {
  comment: "",
  person: "",
  amount: "",
  date_due: new Date(),
};

export const C3DeliveryView = observer((props: { isVisible?: boolean }) => {
  const { isVisible } = props;

  const {
    purchaseStore,
    sparePartStore,
    product2Store,
    payableStore,
    transactionStore,
  } = useStore();

  const [showSearchBar, setShowSearchBar] = useState(false);
  const [query, setQuery] = useState("");
  const [focus, setFocus] = useState(false);
  const [order, setOrder] = useState(-1);
  const [index, setIndex] = useState(0);
  const [details2, setDetails2] = useState(defaultDetails);
  const [isVisible1, setVisible1] = useState(false);

  const toProductName = (t: Product) => {
    return `${sparePartStore.sparePartName(parseInt(t.part))}${
      t.description !== "" ? " " + t.description : ""
    }${t.motors !== "" ? " " + t.motors : ""}${
      t.brand !== "" ? " " + t.brand : ""
    }${
      t.is_orig
        ? " ORIG."
        : sparePartStore.spareParts.find((s) => s.id === parseInt(t.part))
            ?.is_semi_shown
        ? " SEMI."
        : ""
    }`.toUpperCase();
  };

  const currentOrder = purchaseStore.getItem(order);
  const purchaseItems = currentOrder?.purchase_item;

  const totalAmount = totalValue(
    purchaseItems?.map((s) => Math.round(s.purchase_price * s.quantity))
  );

  const totalAmountStock = totalValue(
    purchaseItems?.map((s) =>
      Math.round(
        (product2Store.getItem(s.product)?.sell_price ?? 0) * s.quantity
      )
    )
  );

  const productMatches = product2Store.products
    .filter((s: Product) => {
      if (query === "") {
        return;
      } else if (
        query
          .split(/[ ,]+/)
          .every((v) =>
            toProductName(s).toLowerCase().includes(v.toLowerCase())
          )
      ) {
        return s;
      } else {
        return;
      }
    })
    .filter((s) => !purchaseItems?.map((t) => t.product).includes(s.id));

  const onPressDelivered = () => {
    if (order === -1) return;
    purchaseStore.updateItem(order, { status: "3" });
  };

  const onPressUndo = () => {
    if (order === -1) return;
    purchaseStore.updateItem(order, { status: "2" });
  };

  const closable = purchaseItems
    ?.map((s) => s.is_valid)
    .reduce((a, b) => a && b, true);

  const toProductShortName = (t: Product) => {
    return `${sparePartStore.sparePartName(parseInt(t.part))}${
      t.description !== "" ? " " + t.description : ""
    }${
      t.motors !== "" &&
      sparePartStore.spareParts.find((s) => s.id === parseInt(t.part))
        ?.is_motor_shown
        ? " " + t.motors.split(", ")[0].replaceAll("_", " ")
        : ""
    }${t.brand !== "" ? " " + t.brand : ""}${
      t.is_orig
        ? " ORIG."
        : sparePartStore.spareParts.find((s) => s.id === parseInt(t.part))
            ?.is_semi_shown
        ? " SEMI."
        : ""
    }`.toUpperCase();
  };

  const onPressResult = (item: Product) => {
    purchaseStore.addItemParticularPurchase({
      description: toProductShortName(item),
      unit: item.unit,
      purchase_price:
        Math.round(100 * (item.purchase_price / item.piece_count)) / 100,
      product: item.id,
      purchase: order,
      quantity: item.piece_count,
    });
    setFocus(false);
    setQuery("");
    setShowSearchBar(false);
  };

  const onPressCheck = () => {
    if (
      details2.person === "" ||
      details2.comment === "" ||
      toNumber(details2.amount) === 0 ||
      order === -1
    )
      return;
    payableStore.addItem({
      lender_name: details2.person,
      borrowed_amount: parseFloat(details2.amount),
      description: `Receipt # ${details2.comment}`,
      datetime_due: details2.date_due.toISOString(),
    });
    purchaseStore.updateItem(order, {
      supplier_name: `${details2.person} (${details2.comment})`,
      status: "4",
      datetime_closed: new Date().toISOString(),
      is_active: false,
    });
    transactionStore.addItem({
      description: `Replenish Stocks`,
      amount: totalAmountStock,
      category: 52,
      transmitter: 16,
      receiver: 14,
    });
    setOrder(-1);
  };

  const onPressPrint = () => {
    if (order === -1) return;
    purchaseStore.updateItem(order, {
      to_print: !currentOrder?.to_print,
    });
  };

  useEffect(() => {
    if (isVisible1 && currentOrder) {
      setDetails2({
        ...details2,
        person: currentOrder.supplier_name,
        amount: toMoney(totalAmount),
      });
    }
  }, [isVisible1]);

  return (
    isVisible && (
      <View style={styles.main}>
        <MyOverlay
          title={`Create a Payable`}
          isVisible={isVisible1}
          setVisible={setVisible1}
          onPressCheck={onPressCheck}
        >
          <MyTextInput
            label={"Supplier"}
            value={details2.person}
            onChangeValue={(t) => setDetails2({ ...details2, person: t })}
          />

          <HView>
            <MyTextInput
              label="Amount"
              value={details2.amount}
              onChangeValue={(t) =>
                setDetails2({ ...details2, amount: toNumString(t, true) })
              }
              numeric
              centered
              flex={1}
            />
            <MyTextInput
              label={"Receipt #"}
              value={details2.comment}
              onChangeValue={(t) => setDetails2({ ...details2, comment: t })}
              flex={1}
              numeric
              centered
            />
          </HView>
          <HView>
            <MyText text="Due date:" size="medium" />
            <MyDatePicker
              date={details2.date_due}
              setDate={(t) => setDetails2({ ...details2, date_due: t })}
              range="future"
              size="small"
              noIcon
            />
          </HView>
        </MyOverlay>
        <HView>
          <MyDropdownPicker
            items={purchaseStore.purchases
              .filter((s) => s.status !== "1")
              .filter((s) => s.is_active)
              .map((s) => ({
                value: s.id,
                label: `${s.id} - ${s.supplier_name}`,
              }))}
            value={order}
            setValue={setOrder}
            label="Select an Order"
            flex
          />
          <MyIcon
            name={currentOrder?.status === "2" ? "local-shipping" : "undo"}
            label={currentOrder?.status === "2" ? "Delivered" : "Undo"}
            onPress={
              currentOrder?.status === "2" ? onPressDelivered : onPressUndo
            }
            uncut
            hidden={order === -1 || currentOrder?.status === "4"}
          />
        </HView>
        <SearchBar
          query={query}
          setQuery={setQuery}
          showSearchBar={showSearchBar}
          setShowSearchBar={setShowSearchBar}
          focus={focus}
          setFocus={setFocus}
          hidden={order === -1 || currentOrder?.status !== "3"}
          hasNoLabor
          hasNoBNW
          hasNoDate
          small={!focus}
        />
        <SearchResultList
          onPressItem={onPressResult}
          results={productMatches}
          hidden={!showSearchBar || !focus}
          inputFocus={focus}
          setInputFocus={setFocus}
        />

        <View style={styles.body}>
          <MyList headNote="Order" hidden={focus || !purchaseItems}>
            <FlatList
              data={
                purchaseItems &&
                purchaseItems.slice(10 * index, 10 * (index + 1))
              }
              renderItem={({ item }) => (
                <PurchaseDeliveredCard
                  item={item}
                  locked={currentOrder?.status !== "3"}
                />
              )}
              keyboardShouldPersistTaps="always"
            />
          </MyList>
          <MyDotPager
            index={index}
            setIndex={setIndex}
            length={purchaseItems ? Math.ceil(purchaseItems.length / 10) : 0}
            hidden={!purchaseItems || purchaseItems.length <= 10}
          />
        </View>

        <MyStatusBar
          action1={{
            name: "print",
            onPress: onPressPrint,
            selected: currentOrder?.to_print,
          }}
          action2={
            closable
              ? { name: "star", onPress: () => setVisible1(true) }
              : undefined
          }
          hidden={currentOrder?.status !== "3" || focus}
          amount={totalAmount}
        />
      </View>
    )
  );
});

const styles = StyleSheet.create({
  main: {
    flex: 1,
  },
  body: {
    flex: 1,
  },
  bar: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
});
