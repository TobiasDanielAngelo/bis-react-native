import { observer } from "mobx-react-lite";
import moment from "moment";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { HView } from "../blueprints/HView";
import { MyCard } from "../blueprints/MyCard";
import { MyOverlay } from "../blueprints/MyOverlay";
import { MyQuickList } from "../blueprints/MyQuickList";
import { MyText } from "../blueprints/MyText";
import { MyTextInput } from "../blueprints/MyTextInput";
import { doNothing } from "../constants/constants";
import {
  toMoney,
  toNumString,
  toNumber,
  toProductShortName,
} from "../constants/helpers";
import { useStore } from "../stores/Store";
import { Product } from "../stores/ProductStore";

export const CheckCard = observer(
  (props: {
    hidden?: boolean;
    item: Product;
    locked?: boolean;
    noActions?: boolean;
  }) => {
    const { item, hidden, locked, noActions } = props;
    const {
      sparePartStore,
      productStore,
      countItemStore,
      motorStore,
      transactionStore,
    } = useStore();

    const [isVisible1, setVisible1] = useState(false);
    const [isVisible2, setVisible2] = useState(false);
    const [isVisible3, setVisible3] = useState(false);
    const [isVisible4, setVisible4] = useState(false);
    const [details, setDetails] = useState({
      toPrint: item.print_count.toString(),
      location: item.location,
      quantity: "",
      minQuantity: item.min_quantity.toString(),
      sellPrice: item.sell_price.toFixed(2),
    });

    const sold = item.sold ?? 0;
    const purchased = item.purchased ?? 0;
    const returned = item.returned ?? 0;
    const counted = item.counted ?? 0;

    const netQty = purchased + returned - sold + counted;

    const onChangeLocation = (t: string) => {
      setDetails({ ...details, location: t });
    };

    const onChangeQuantity = (t: string) => {
      setDetails({ ...details, quantity: toNumString(t) });
    };

    const onChangeMinQuantity = (t: string) => {
      setDetails({ ...details, minQuantity: toNumString(t) });
    };

    const onChangeSellPrice = (t: string) => {
      setDetails({ ...details, sellPrice: toNumString(t, true) });
    };

    const onChangePrintCount = (t: string) => {
      setDetails({ ...details, toPrint: toNumString(t) });
    };

    const onPressCheck1 = () => {
      if (details.location.length !== 1) return;
      productStore.updateProduct(item.id, { location: details.location });
    };

    const onPressCheck2 = () => {
      if (isNaN(parseFloat(details.toPrint))) return;
      productStore.updateProduct(item.id, {
        print_count: toNumber(details.toPrint),
      });
    };

    const onPressCheck3 = async () => {
      if (isNaN(parseFloat(details.quantity))) return;
      await countItemStore.addItem({
        quantity: toNumber(details.quantity) - netQty,
        product: item.id,
      });
      if (toNumber(details.quantity) > netQty) {
        await transactionStore.addItem({
          description: item.datetime_updated
            ? `Stock Gained for ${item.id}`
            : `Initial for ${item.id}`,
          amount:
            Math.abs(toNumber(details.quantity) - netQty) * item.sell_price,
          category: item.datetime_updated ? 53 : 48,
          transmitter: item.datetime_updated ? 11 : 19,
          receiver: 14,
        });
      } else if (toNumber(details.quantity) < netQty) {
        await transactionStore.addItem({
          description: item.datetime_updated
            ? `Stock Lost for ${item.id}`
            : `Initial for ${item.id}`,
          amount:
            Math.abs(toNumber(details.quantity) - netQty) * item.sell_price,
          category: item.datetime_updated ? 53 : 48,
          transmitter: 14,
          receiver: item.datetime_updated ? 11 : 19,
        });
      }
      await productStore.updateProduct(item.id, {
        datetime_updated: new Date().toISOString(),
      });
      onPressRefresh();
    };

    const onPressCheck4 = () => {
      if (
        isNaN(parseFloat(details.minQuantity)) ||
        isNaN(parseFloat(details.sellPrice)) ||
        parseFloat(details.sellPrice) <= item.purchase_price
      )
        return;
      productStore.updateProduct(item.id, {
        min_quantity: parseInt(details.minQuantity),
        sell_price: parseFloat(details.sellPrice),
      });
    };

    const onPressRefresh = () => {
      productStore.fetchProducts({ ids: [item.id] });
      setDetails({ ...details, quantity: "" });
    };
    const onChangeExpectedQty = () => {
      setDetails({
        ...details,
        quantity: netQty.toString(),
      });
    };

    useEffect(() => {
      if (isVisible3) onPressRefresh();
    }, [isVisible3]);

    return (
      <>
        <MyOverlay
          title="Edit Location"
          isVisible={isVisible1}
          setVisible={setVisible1}
          onPressCheck={onPressCheck1}
        >
          <MyTextInput
            value={details.location}
            onChangeValue={onChangeLocation}
            label="Location"
            maxLength={1}
            centered
          />
        </MyOverlay>
        <MyOverlay
          title="Print Labels"
          isVisible={isVisible2}
          setVisible={setVisible2}
          onPressCheck={onPressCheck2}
        >
          <MyTextInput
            value={details.toPrint}
            onChangeValue={onChangePrintCount}
            label="Number of Labels"
            numeric
            centered
          />
        </MyOverlay>
        <MyOverlay
          title="Inventory Count"
          isVisible={isVisible3}
          setVisible={setVisible3}
          actionLogo1="select-all"
          onPressAction1={onChangeExpectedQty}
          onPressCheck={onPressCheck3}
        >
          <MyTextInput
            value={details.quantity}
            onChangeValue={onChangeQuantity}
            label="Quantity"
            numeric
            centered
          />
          <MyText
            text={`This will change quantity by ${
              toNumber(details.quantity) - netQty
            } ${item.unit} - Continue?`}
            size="medium"
            success={toNumber(details.quantity) > netQty}
            error={toNumber(details.quantity) < netQty}
            hidden={
              toNumber(details.quantity) === netQty || details.quantity === ""
            }
          />
        </MyOverlay>
        <MyOverlay
          isVisible={isVisible4}
          setVisible={setVisible4}
          title="Edit Minimum Sets"
          onPressCheck={onPressCheck4}
        >
          <MyTextInput
            label="Minimum Quantity (Set)"
            value={details.minQuantity}
            onChangeValue={onChangeMinQuantity}
            numeric
            centered
          />
          <MyTextInput
            label="Selling Price"
            value={details.sellPrice}
            onChangeValue={onChangeSellPrice}
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
              text: toProductShortName(sparePartStore, item),
              type: "main",
            },
            {
              id: 2,
              text: `Purchase: \u20b1${toMoney(item.purchase_price)} for ${
                item.piece_count
              } ${item.unit}`,
              type: "sub",
            },
            {
              id: 3,
              text: `Selling: \u20b1${toMoney(item.sell_price)} for ${
                item.piece_count
              } ${item.unit}`,
              type: "sub",
            },
            {
              id: 4,
              text: `Located at Shelf ${item.location} | For label: ${item.print_count}`,
              type: "sub",
            },
            {
              id: 5,
              text: item.datetime_updated
                ? `Latest count on: ${moment(item.datetime_updated).format(
                    "MMM. DD, 'YY h:mm A"
                  )}`
                : "No counts done.",
              type: "sub",
            },
          ]}
          hidden={hidden}
          actions={
            !noActions
              ? [
                  {
                    id: 1,
                    name: "location-on",
                    position: "Q4",
                    onPress: () => setVisible1(true),
                  },
                  {
                    id: 2,
                    name: "print",
                    position: "Q5",
                    onPress: () => setVisible2(true),
                  },
                  {
                    id: 3,
                    name: "inventory",
                    position: "Q6",
                    onPress: () => setVisible3(true),
                  },
                  {
                    id: 4,
                    name: "refresh",
                    position: "Q3",
                    onPress: onPressRefresh,
                  },
                  {
                    id: 5,
                    name: "edit",
                    position: "Q1",
                    onPress: () => setVisible4(true),
                  },
                ]
              : []
          }
          unit={item.unit}
        >
          <MyQuickList
            values={item.motors
              .split(", ")
              .map((s) => motorStore.motorId(s) ?? -1)}
            items={motorStore.motors.map((s) => ({
              value: s.id,
              label: s.name.replaceAll("_", " "),
            }))}
            setValues={doNothing}
            hidden={item.motors.length === 0}
          />
          <HView>
            <View style={styles.textBox}>
              <Text style={styles.text}>Purchased</Text>
              <Text style={styles.text}>
                {item.purchased
                  ? `${item.purchased} ${item.unit}`
                  : `0 ${item.unit}`}
              </Text>
            </View>
            <View style={styles.textBox}>
              <Text style={styles.text}>Sold</Text>
              <Text style={styles.text}>
                {item.sold ? `${item.sold} ${item.unit}` : `0 ${item.unit}`}
              </Text>
            </View>
            <View style={styles.textBox}>
              <Text style={styles.text}>Returned</Text>
              <Text style={styles.text}>
                {item.returned
                  ? `${item.returned} ${item.unit}`
                  : `0 ${item.unit}`}
              </Text>
            </View>

            <View style={styles.textBox}>
              <Text
                style={[
                  styles.text,
                  {
                    color: item.counted
                      ? item.counted >= 0
                        ? "teal"
                        : "darkred"
                      : "black",
                  },
                ]}
              >
                Gained/Lost
              </Text>
              <Text
                style={[
                  styles.text,
                  {
                    color: item.counted
                      ? item.counted >= 0
                        ? "teal"
                        : "darkred"
                      : "black",
                  },
                ]}
              >
                {item.counted
                  ? `${item.counted} ${item.unit}`
                  : `0 ${item.unit}`}
              </Text>
            </View>
          </HView>
        </MyCard>
      </>
    );
  }
);

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
  textBox: {
    alignItems: "center",
  },
  text: { color: "teal" },
});
