import { StyleSheet, Text, View } from "react-native";
import { winWidth } from "../constants/constants";
import { ProductInterface } from "../constants/interfaces";
import { useStore } from "../stores/Store";

export const ViewProductItem = (props: {
  product: ProductInterface;
  selected: boolean;
}) => {
  const { sparePartStore } = useStore();

  return (
    <View
      style={[
        styles.listItem,
        styles.shadowProp,
        {
          height: props.selected ? 180 : 90,
        },
      ]}
    >
      <Text style={styles.descriptionText}>
        {sparePartStore.sparePartName(parseInt(props.product.part))}
      </Text>

      <View
        style={{
          flex: 1,
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <Text style={styles.mainItemText}>
          {`${props.product.generic.replace(
            (sparePartStore.sparePartName(parseInt(props.product.part)) ?? "") +
              " ",
            ""
          )}`}
        </Text>
      </View>
      <View style={{ display: props.selected ? "flex" : "none" }}>
        <Text style={styles.descriptionText}>
          {props.product.motors === ""
            ? ""
            : `For motors ${props.product.motors
                .replaceAll("_", " ")
                .substring(0, 35)}${
                props.product.motors.length > 35 ? "..." : ""
              }`}
        </Text>
        <Text style={styles.descriptionText}>
          {`Purchasing @ ${props.product.purchase_price} @ ${props.product.piece_count} ${props.product.unit}`}
        </Text>
        <Text style={styles.descriptionText}>
          {`Selling @ ${props.product.sell_price} @ ${props.product.piece_count} ${props.product.unit}`}
        </Text>
        <Text style={styles.descriptionText}>
          {`Located @ Shelf ${props.product.location}`}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  listItem: {
    backgroundColor: "white",
    padding: 10,
    marginTop: 10,
    marginHorizontal: 10,
    marginBottom: 7,
    width: winWidth - 20,
  },
  shadowProp: {
    shadowColor: "black",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 7,
    elevation: 5,
  },
  descriptionText: {
    fontSize: 15,
    textAlign: "left",
    color: "grey",
    fontFamily: "monospace",
  },
  priceText: { fontSize: 19, textAlign: "right", fontFamily: "monospace" },
  mainItemText: { fontSize: 18, textAlign: "left", fontFamily: "monospace" },
});
