import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { HView } from "../blueprints/HView";
import { MyButton } from "../blueprints/MyButton";
import { MyDotPager } from "../blueprints/MyDotPager";
import { MyDropdownPicker } from "../blueprints/MyDropdownPicker";
import { MyDropdownPickers } from "../blueprints/MyDropdownPickers";
import { MyIcon } from "../blueprints/MyIcon";
import { MyList } from "../blueprints/MyList";
import { MyOverlay } from "../blueprints/MyOverlay";
import { MyStatusBar } from "../blueprints/MyStatusBar";
import { MyText } from "../blueprints/MyText";
import { MyTextInput } from "../blueprints/MyTextInput";
import { PurchaseChosenCard } from "../components/PurchaseChosenCard";
import { PurchasePickCard } from "../components/PurchasePickCard";
import { doNothing, suppliers } from "../constants/constants";
import {
  toNumString,
  toProductShortName,
  totalValue,
} from "../constants/helpers";
import { purchaseStore } from "../stores/PurchaseStore";
import { useStore } from "../stores/Store";

const hasIntersect = (arr1: any[], arr2: any[]) => {
  return arr1.filter((s) => arr2.includes(s)).length > 0;
};

export const C1OrderView = observer((props: { isVisible?: boolean }) => {
  const { isVisible } = props;
  const { sparePartStore, productStore, motorStore } = useStore();
  const [showOrders, setShowOrders] = useState(true);
  const [part, setPart] = useState(-1);
  const [item, setItem] = useState(-1);
  const [order, setOrder] = useState(-1);
  const [refresh, setRefresh] = useState(0);
  const [index, setIndex] = useState(0);
  const [index2, setIndex2] = useState(0);
  const [index3, setIndex3] = useState(0);
  const [isVisible1, setVisible1] = useState(false);
  const [isVisible2, setVisible2] = useState(false);
  const [isVisible3, setVisible3] = useState(false);
  const [motors, setMotors] = useState<number[]>([]);
  const [description, setDescription] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [value, setValue] = useState("");
  const [value2, setValue2] = useState("");

  const productMatches =
    part === -1 && motors.length === 0
      ? []
      : productStore.products
          .filter((s) => (part === -1 ? true : s.part === part))
          .filter((s) =>
            motors.length === 0
              ? true
              : hasIntersect(
                  motors,
                  s.motors.split(", ").map((s) => motorStore.motorId(s))
                )
          );

  const currentOrder = purchaseStore.getItem(order);

  const purchaseItems = currentOrder?.purchase_item;

  const onChangePP = (t: string) => {
    setPurchasePrice(toNumString(t, true));
  };

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

  const onPressCheck3 = () => {
    if (description === "" || isNaN(parseFloat(purchasePrice))) return;
    purchaseStore.addItemParticularPurchase({
      purchase: order,
      description: description.toUpperCase(),
      is_valid: false,
      purchase_price: parseFloat(purchasePrice),
    });
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
    purchaseStore.deleteAll();
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
          />
        </MyOverlay>
        <MyOverlay
          title={`Add a new item`}
          isVisible={isVisible3}
          setVisible={setVisible3}
          onPressCheck={onPressCheck3}
          onPressAction1={doNothing}
        >
          <MyTextInput
            value={description}
            onChangeValue={setDescription}
            label="Description/Unit"
            centered
          />
          <MyTextInput
            value={purchasePrice}
            onChangeValue={onChangePP}
            label="Purchase Price (Est.)"
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
                label: s.supplier_name,
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
        <HView>
          <MyDropdownPicker
            items={[
              { value: -1, label: "ALL PARTS" },
              ...sparePartStore.spareParts.map((s) => ({
                value: s.id,
                label: s.name,
              })),
            ]}
            value={part}
            setValue={setPart}
            label="Part Category"
            hidden={showOrders}
            flex
          />
          <MyDropdownPickers
            items={motorStore.motors.map((s) => ({
              value: s.id,
              label: s.name.replaceAll("_", " "),
            }))}
            values={motors}
            setValues={setMotors}
            hidden={showOrders}
            label="Filter by Motor(s)"
            flex
          />
        </HView>
        <View style={styles.body}>
          <MyList
            headNote={`Products (${
              item === -1 ? productMatches.length : 1
            } Results)`}
            hidden={
              showOrders ||
              !productMatches ||
              productMatches.slice(10 * index, 10 * (index + 1)).length === 0
            }
          >
            <FlatList
              data={
                item === -1
                  ? productMatches.slice(10 * index, 10 * (index + 1))
                  : productMatches.filter((s) => s.id === item)
              }
              removeClippedSubviews={false}
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
              removeClippedSubviews={false}
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
        <MyDropdownPicker
          items={[
            { value: -1, label: "ALL MATCHES" },
            ...productMatches.map((s) => ({
              value: s.id,
              label: toProductShortName(sparePartStore, s),
            })),
          ]}
          value={item}
          setValue={setItem}
          label="Select Item"
          hidden={showOrders}
        />
        <MyDotPager
          length={Math.ceil(productMatches.length / 10)}
          index={index}
          setIndex={setIndex}
          hidden={showOrders || productMatches.length <= 10 || item !== -1}
        />
        <MyDotPager
          length={purchaseItems ? Math.ceil(purchaseItems.length / 10) : 0}
          index={index2}
          setIndex={setIndex2}
          hidden={!showOrders || !purchaseItems || purchaseItems.length <= 10}
        />
        <HView>
          <MyButton
            label={!showOrders ? "View Order" : "View Products"}
            onPress={toggleShow}
            flex
          />
          <MyIcon
            name="add"
            onPress={() => setVisible3(true)}
            noLabel
            size="small"
            hidden={order === -1}
          />
        </HView>
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
