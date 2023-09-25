import { useContext } from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { POSContext } from "../../../constants/interfaces";
import { LaborPOSItem } from "../units/LaborPOSItem";

export const CustomerLaborItems = (props: {}) => {
  const { customer, laborItems, focus, setPopup, setLaborItem } =
    useContext(POSContext);

  return (
    <>
      {!focus && (
        <>
          <Text
            style={{
              margin: 10,
              fontSize: 20,
              display:
                laborItems.filter((s) => s.custId === customer.id).length !== 0
                  ? "flex"
                  : "none",
            }}
          >
            Labor
          </Text>
          {laborItems
            .filter((s) => s.custId === customer.id)
            .map((s) => (
              <TouchableOpacity
                onPress={() => {
                  if (customer.paymentStatus === "not paid") {
                    setLaborItem(s);
                    setPopup("labor");
                  }
                }}
                key={`labor-${s?.id}`}
              >
                <LaborPOSItem
                  description={s.description}
                  laborer={s.laborer}
                  cost={s.cost}
                  collected={s.collected}
                />
              </TouchableOpacity>
            ))}
        </>
      )}
    </>
  );
};

const styles = StyleSheet.create({});
