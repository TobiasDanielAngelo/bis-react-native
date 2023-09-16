import { StyleSheet, TouchableOpacity, Text } from "react-native";
import { useContext } from "react";
import { LaborPOSItem } from "./LaborPOSItem";
import { POSContext } from "../../interfaces/interfaces";

export const CustomerLaborItems = (props: any) => {
  const { customer, laborItems, focused, paymentStatus } =
    useContext(POSContext);

  return (
    <>
      {!focused && (
        <>
          <Text
            style={{
              margin: 10,
              fontSize: 20,
              display:
                laborItems.filter((s) => s.custId === customer).length !== 0
                  ? "flex"
                  : "none",
            }}
          >
            Labor
          </Text>
          {laborItems
            .filter((s) => s.custId === customer)
            .map((s) => (
              <TouchableOpacity
                onPress={() => {
                  if (paymentStatus === "not paid") {
                    props.setLaborPopup(true);
                    props.setLaborItem(s?.id ?? -1);
                  }
                }}
                key={`labor-${s?.id}-${customer}`}
                onLongPress={() => {
                  if (paymentStatus === "validating") {
                  }
                  // props.toggleClaimed(
                  //   s?.id ?? -1,
                  //   !(
                  //     salesItems.find(
                  //       (t) => t.custId === customer && t.itemId === s?.id
                  //     )?.claimed ?? false
                  //   )
                  // );
                }}
              >
                <LaborPOSItem
                  description={s.description.split(", ")[1]}
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
