import { useContext } from "react";
import { ScrollView } from "react-native-gesture-handler";
import { M3S3Context } from "../constants/interfaces";
import { PotentialProductItem } from "./M3S3U1";

export const PurchaseOrderList = () => {
  const { orderItems, order, search } = useContext(M3S3Context);

  return (
    <ScrollView
      style={{
        marginHorizontal: 5,
        marginTop: 5,
      }}
      keyboardShouldPersistTaps="always"
    >
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
