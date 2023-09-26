import { ScrollView, TouchableOpacity, View } from "react-native";
import { isEqualDate } from "../constants/helpers";
import { CustomerViewItem } from "./M1S4U1";
import { useContext, useState } from "react";
import { defaultCustomer } from "../constants/constants";
import { M1S4Context } from "../constants/interfaces";

export const CustomerViewItems = () => {
  const {
    customer,
    setCustomer,
    customers,
    date,
    salesItems,
    laborItems,
    returnItems,
  } = useContext(M1S4Context);

  return (
    <ScrollView style={{ backgroundColor: "lightcyan" }}>
      <View>
        {customers
          .filter((s) => isEqualDate(s.dateTransacted, date.toString()))
          .map((s) => (
            <TouchableOpacity
              key={`$custView-${s.id}`}
              onPress={() => {
                s.id === customer.id
                  ? setCustomer(defaultCustomer)
                  : setCustomer(s);
              }}
            >
              <CustomerViewItem
                customer={s}
                customerSalesItems={salesItems.filter((t) => t.custId === s.id)}
                customerLaborItems={laborItems.filter((t) => t.custId === s.id)}
                customerReturnItems={returnItems.filter(
                  (t) => t.custId === s.id
                )}
                selected={s.id === customer.id}
              />
            </TouchableOpacity>
          ))}
      </View>
    </ScrollView>
  );
};
