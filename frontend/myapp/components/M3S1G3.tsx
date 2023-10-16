import { Text, View } from "react-native";
import { useContext, useState, useCallback, useEffect } from "react";
import { defaultProductInterface } from "../constants/constants";
import { PotentialProductItem } from "./M3S1U1";
import { M3S1Context } from "../constants/interfaces";
import { ScrollView } from "react-native-gesture-handler";

export const PurchaseOrderList = () => {
  const { orderItems, order } = useContext(M3S1Context);

  return (
    <ScrollView style={{ marginHorizontal: 5, marginTop: 5 }}>
      {orderItems
        .filter((s) => s.orderId === order)
        .map((s) => (
          <PotentialProductItem
            order={s}
            selected={false}
            key={`ppi-${s.id}`}
          />
        ))}
    </ScrollView>
  );
};
