import { Text, View, StyleSheet } from "react-native";
import { useContext } from "react";
import {
  Customer,
  CustomerLaborItem,
  CustomerSalesItem,
  ReviewContext,
} from "../../interfaces/interfaces";
import { winWidth } from "../../constants/Constants";

export const CustomerViewItem = (props: {
  customer: Customer;
  customerSalesItems: CustomerSalesItem[];
  customerLaborItems: CustomerLaborItem[];
  selected: boolean;
}) => {
  const { items } = useContext(ReviewContext);
  return (
    <View
      style={[
        styles.listItem,
        styles.shadowProp,
        {
          height: props.selected ? 200 : 70,
        },
      ]}
    >
      <View>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ fontSize: 20 }}>#{props.customer.id}</Text>
          <Text style={{ fontSize: 20 }}>
            {props.customer.paid.toUpperCase()}
          </Text>
        </View>
        <Text>{props.customer.name}</Text>
      </View>
      {props.selected && (
        <View style={{ margin: 10 }}>
          {props.customerSalesItems.map((s) => (
            <Text
              style={{ fontSize: 16 }}
              key={`salesItems-${s.itemId}-${s.custId}`}
            >
              - {s.qty}pc{s.qty > 1 ? "s" : ""}.{" "}
              {items.find((t) => t.id === s.itemId)?.name}
            </Text>
          ))}
          {props.customerLaborItems.map((s) => (
            <Text
              style={{ fontSize: 16 }}
              key={`laborItems-${s.description}-${s.custId}`}
            >
              - {s.description.split(", ")[1]} {s.collected}/
              {parseInt(`${s.cost}`)} ({s.laborer})
            </Text>
          ))}
        </View>
      )}
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 7,
    elevation: 5,
  },
});
