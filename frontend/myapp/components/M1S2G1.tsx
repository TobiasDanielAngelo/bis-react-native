import { useCallback, useContext, useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { defaultLaborItem } from "../constants/constants";
import { isEqualDate, laborDueToMechanic } from "../constants/helpers";
import { CustomerLaborItem, M1S2Context } from "../constants/interfaces";
import { useStore } from "../stores/Store";
import { LaborRedeemItem } from "./M1S2U1";
import { MechanicLaborCategorizedItems } from "./M1S2G3";

export const RedeemList = () => {
  const { laborItems, customers, laborer, setLaborItems } =
    useContext(M1S2Context);
  const { particularPOSStore } = useStore();

  const handleGiven = useCallback(
    async (laborId: number, collected: number, laborer: string) => {
      await particularPOSStore.updateParticularPOS(`${laborId}`, {
        remarks: `${laborer} ${collected}`,
      });

      setLaborItems((prev: CustomerLaborItem[]) => {
        (prev.find((s) => s.id === laborId) ?? defaultLaborItem).collected =
          collected;
        return [...prev];
      });
    },
    [laborItems]
  );

  const isNameVisible = useMemo(
    () =>
      laborItems.filter(
        (u) =>
          u.laborer === laborer &&
          u.collected !==
            laborDueToMechanic(
              u.description.split(" ")[1],
              parseFloat(`${u.cost}`)
            )
      ).length > 0,
    [laborItems, laborer]
  );

  const isUnpaidVisible = useMemo(
    () =>
      laborItems.filter(
        (s) =>
          s.laborer === laborer &&
          customers.find((u) => u.id === s.custId)?.paymentStatus !== "paid"
      ).length > 0,
    [laborItems, laborer, customers]
  );

  const isUncollectedVisible = useMemo(
    () =>
      laborItems.filter(
        (s) =>
          s.laborer === laborer &&
          s.collected !==
            laborDueToMechanic(
              s.description.split(" ")[1],
              parseFloat(`${s.cost}`)
            ) &&
          customers.find((u) => u.id === s.custId)?.paymentStatus === "paid"
      ).length > 0,
    [laborer, customers, laborItems]
  );

  const isCollectedVisible = useMemo(
    () =>
      laborItems.filter(
        (s) =>
          s.laborer === laborer &&
          s.collected ===
            laborDueToMechanic(
              s.description.split(" ")[1],
              parseFloat(`${s.cost}`)
            ) &&
          customers.find((u) => u.id === s.custId)?.paymentStatus === "paid"
      ).length > 0,
    [laborer, customers, laborItems]
  );

  return (
    <ScrollView style={styles.laborItems}>
      <Text
        style={{
          margin: 10,
          fontSize: 20,
          display: isNameVisible ? "flex" : "none",
        }}
      >
        {laborer}
      </Text>
      <MechanicLaborCategorizedItems
        visible={isUnpaidVisible}
        title={"Customer Not Paid / Validating"}
        laborItems={laborItems.filter(
          (s) =>
            s.laborer === laborer &&
            customers.find((u) => u.id === s.custId)?.paymentStatus !== "paid"
        )}
        keyword={"laborunpaid"}
        disabled={true}
      />
      <MechanicLaborCategorizedItems
        visible={isUncollectedVisible}
        title={"Not collected"}
        laborItems={laborItems.filter(
          (s) =>
            s.laborer === laborer &&
            s.collected !==
              laborDueToMechanic(
                s.description.split(" ")[1],
                parseFloat(`${s.cost}`)
              ) &&
            customers.find((u) => u.id === s.custId)?.paymentStatus === "paid"
        )}
        keyword={"laboruncollected"}
        disabled={false}
        onPress={(s: CustomerLaborItem) => {
          handleGiven(
            s.id,
            laborDueToMechanic(
              s.description.split(" ")[1],
              parseFloat(`${s.cost}`)
            ),
            s.laborer
          );
        }}
      />
      <MechanicLaborCategorizedItems
        visible={isCollectedVisible}
        title={"Collected"}
        laborItems={laborItems.filter(
          (s) =>
            s.laborer === laborer &&
            s.collected ===
              laborDueToMechanic(
                s.description.split(" ")[1],
                parseFloat(`${s.cost}`)
              )
        )}
        keyword={"laborcollected"}
        disabled={false}
        onLongPress={(s: CustomerLaborItem) => {
          s.collected !==
          laborDueToMechanic(
            s.description.split(" ")[1],
            parseFloat(`${s.cost}`)
          )
            ? handleGiven(
                s.id,
                laborDueToMechanic(
                  s.description.split(" ")[1],
                  parseFloat(`${s.cost}`)
                ),
                s.laborer
              )
            : handleGiven(s.id, 0, s.laborer);
        }}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  laborItems: {
    backgroundColor: "lightcyan",
    marginTop: 10,
  },
});
