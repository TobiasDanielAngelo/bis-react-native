import { StyleSheet, TouchableOpacity, Text } from "react-native";
import { useContext } from "react";
import { LaborPOSItem } from "./LaborPOSItem";
import { POSContext } from "../../interfaces/interfaces";

export const CustomerLaborItems = (props: {
  setLaborItem: (laborItem: number) => void;
}) => {
  const { customer, laborItems, focused, paymentStatus, setPopup } =
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
                    setPopup("labor");
                    props.setLaborItem(s?.id ?? -1);
                  }
                }}
                key={`labor-${s?.id}-${customer}`}
                onLongPress={() => {
                  if (paymentStatus === "validating") {
                  }
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
