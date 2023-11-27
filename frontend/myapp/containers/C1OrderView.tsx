import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { HView } from "../blueprints/HView";
import { MyButton } from "../blueprints/MyButton";
import { MyDotPager } from "../blueprints/MyDotPager";
import { MyDropdownPicker } from "../blueprints/MyDropdownPicker";
import { MyIcon } from "../blueprints/MyIcon";
import { MyList } from "../blueprints/MyList";
import { MyOverlay } from "../blueprints/MyOverlay";
import { MyStatusBar } from "../blueprints/MyStatusBar";
import { MyText } from "../blueprints/MyText";
import { MyTextInput } from "../blueprints/MyTextInput";
import { PurchaseChosenCard } from "../components/PurchaseChosenCard";
import { PurchasePickCard } from "../components/PurchasePickCard";
import { doNothing, suppliers } from "../constants/constants";
import { totalValue } from "../constants/helpers";
import { purchaseStore } from "../stores/PurchaseStore";
import { useStore } from "../stores/Store";

const defaultProduct = {
  part: -1,
  brand: "",
  pieces: "1",
  unitPP: "",
  packPP: "",
  unitSP: "",
  packSP: "",
  miscInfo: "",
  location: "",
  minimum: "",
  unit: "pc.",
  isOrig: false,
};

export const C1OrderView = observer((props: { isVisible?: boolean }) => {
  const { isVisible } = props;
  const { sparePartStore, productStore } = useStore();
  const [showOrders, setShowOrders] = useState(true);
  const [part, setPart] = useState(-1);
  const [order, setOrder] = useState(-1);
  const [refresh, setRefresh] = useState(0);
  const [index, setIndex] = useState(0);
  const [index2, setIndex2] = useState(0);
  const [index3, setIndex3] = useState(0);
  const [isVisible1, setVisible1] = useState(false);
  const [isVisible2, setVisible2] = useState(false);
  const [value, setValue] = useState("");
  const [value2, setValue2] = useState("");

  const [details, setDetails] = useState(defaultProduct);
  const [motors, setMotors] = useState<number[]>([]);

  const productMatches = productStore.products
    .filter((s) => s.part === part)
    .sort((a, b) =>
      (a.purchased - a.sold + a.returned + a.counted) / (a.min_quantity + 1) >
      (b.purchased - b.sold + b.returned + b.counted) / (b.min_quantity + 1)
        ? 1
        : -1
    );

  const currentOrder = purchaseStore.getItem(order);

  const purchaseItems = currentOrder?.purchase_item;

  const onPressCheck = async () => {
    if (value === "") return;
    const resp = await purchaseStore.addItem(value);
    if (resp.data) setOrder(resp.data.id);
  };

  const onPressCheck2 = () => {
    if (value2 !== `DATS00${order}`) return;
    purchaseStore.deleteItem(order);
    setOrder(-1);
  };

  const onPressPrint = () => {
    if (order === -1) return;
    purchaseStore.updateItem(order, { to_print: !currentOrder?.to_print });
  };

  const onPressDelete = () => {
    setVisible2(true);
  };

  const onPressUndo = () => {
    purchaseStore.updateItem(order, { status: "1" });
  };

  const onPressSend = () => {
    purchaseStore.updateItem(order, { status: "2" });
    setOrder(-1);
  };

  const toggleShow = useCallback(() => {
    setShowOrders((prev) => !prev);
  }, [showOrders]);

  const onPressShuffle = () => {
    if (index3 < suppliers.length) {
      setIndex3((prev) => prev + 1);
    } else {
      setIndex3(0);
    }
  };

  useEffect(() => {
    setValue(suppliers[index3]);
  }, [index3]);

  useEffect(() => {
    setIndex(0);
  }, [part]);

  useEffect(() => {
    setIndex2(0);
  }, [order]);

  useEffect(() => {
    purchaseStore.fetchAll({ isActive: true });
  }, [refresh]);

  return (
    isVisible && (
      <View style={styles.main}>
        <MyOverlay
          title="Add Purchase Order"
          isVisible={isVisible1}
          setVisible={setVisible1}
          onPressCheck={onPressCheck}
          actionLogo1="shuffle"
          onPressAction1={onPressShuffle}
        >
          <MyTextInput
            value={value}
            onChangeValue={setValue}
            label="Supplier"
            centered
          />
        </MyOverlay>
        <MyOverlay
          title={`Confirm deletion of PO # ${order}?`}
          isVisible={isVisible2}
          setVisible={setVisible2}
          onPressCheck={onPressCheck2}
          onPressAction1={doNothing}
        >
          <MyText text={`DATS00${order}`} />
          <MyTextInput
            value={value2}
            onChangeValue={setValue2}
            label="Code"
            centered
            numeric
          />
        </MyOverlay>
        <HView hidden={!showOrders}>
          <MyIcon
            name="delete"
            size="medium"
            noLabel
            disabled={order === -1 || currentOrder?.status === "2"}
            onPress={onPressDelete}
          />
          <MyDropdownPicker
            items={purchaseStore.purchases
              .filter((s) => s.status === "1" || s.status === "2")
              .filter((s) => s.is_active)
              .map((s) => ({
                value: s.id,
                label: `${s.id} - ${s.supplier_name}`,
              }))}
            value={order}
            setValue={setOrder}
            flex
            label="Select an Order"
          />
          <MyIcon
            name="add"
            size="medium"
            noLabel
            onPress={() => setVisible1(true)}
          />
        </HView>
        <MyDropdownPicker
          items={sparePartStore.spareParts.map((s) => ({
            value: s.id,
            label: s.name,
          }))}
          value={part}
          setValue={setPart}
          label="Part Category"
          hidden={showOrders}
        />
        <View style={styles.body}>
          <MyList
            headNote="Products"
            hidden={
              showOrders ||
              !productMatches ||
              productMatches.slice(10 * index, 10 * (index + 1)).length === 0
            }
          >
            <FlatList
              data={productMatches.slice(10 * index, 10 * (index + 1))}
              renderItem={({ item }) => (
                <PurchasePickCard
                  item={item}
                  locked={
                    order === -1 ||
                    purchaseItems?.map((s) => s.product).includes(item.id) ||
                    currentOrder?.status !== "1"
                  }
                  purchaseId={order}
                />
              )}
              keyboardShouldPersistTaps="always"
            />
          </MyList>
          <MyList
            headNote="Order"
            hidden={
              !showOrders ||
              !purchaseItems ||
              purchaseItems?.slice(10 * index2, 10 * (index2 + 1)).length === 0
            }
          >
            <FlatList
              data={
                purchaseItems &&
                purchaseItems.slice(10 * index2, 10 * (index2 + 1))
              }
              renderItem={({ item }) => (
                <PurchaseChosenCard
                  item={item}
                  locked={currentOrder?.status !== "1"}
                />
              )}
              keyboardShouldPersistTaps="always"
            />
          </MyList>
        </View>
        <MyDotPager
          length={Math.ceil(productMatches.length / 10)}
          index={index}
          setIndex={setIndex}
          hidden={showOrders || productMatches.length <= 10}
        />
        <MyDotPager
          length={purchaseItems ? Math.ceil(purchaseItems.length / 10) : 0}
          index={index2}
          setIndex={setIndex2}
          hidden={!showOrders || !purchaseItems || purchaseItems.length <= 10}
        />
        <MyButton
          label={!showOrders ? "View Order" : "View Products"}
          onPress={toggleShow}
        />
        <MyStatusBar
          action1={{ name: "refresh", onPress: () => setRefresh((t) => t + 1) }}
          action2={{
            name: "print",
            onPress: onPressPrint,
            selected: currentOrder?.to_print,
          }}
          action3={{
            name: currentOrder?.status === "2" ? "undo" : "send",
            onPress: currentOrder?.status === "2" ? onPressUndo : onPressSend,
          }}
          hidden={order === -1}
          amount={totalValue(
            purchaseItems?.map((s) => Math.round(s.purchase_price * s.quantity))
          )}
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
