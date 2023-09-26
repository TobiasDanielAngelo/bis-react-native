import { useCallback, useContext, useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { Icon, Overlay } from "react-native-elements";
import SelectDropdown from "react-native-select-dropdown";
import { defaultLaborItem, labors, mechanics } from "../constants/constants";
import { CustomerLaborItem, M1S1Context } from "../constants/interfaces";
import { useStore } from "../stores/Store";

Icon.defaultProps = Icon.defaultProps || {};
Icon.defaultProps.delayPressIn = 0;

export const LaborItemModal = (props: {}) => {
  const {
    customer,
    laborItem,
    laborItems,
    popup,
    setPopup,
    setLaborItems,
    setLaborItem,
  } = useContext(M1S1Context);
  const { particularPOSStore } = useStore();
  const [cost, setCost] = useState("0");
  const [mechanic, setMechanic] = useState("");
  const [labor, setLabor] = useState("Labor (Others)");

  const onCreateLabor = useCallback(async () => {
    const resp = await particularPOSStore.addParticularPOS(
      {
        remarks: `${mechanic} 0`,
        description: `Labor ${labor}`,
        quantity: 1,
        unit_amount: parseFloat(cost),
      },
      customer.id
    );

    setLaborItems((prev) => [
      ...prev,
      {
        id: parseInt(resp.data?.id ?? "-1"),
        custId: customer.id,
        laborer: mechanic,
        description: `Labor ${labor}`,
        cost: parseFloat(cost),
        collected: 0,
      },
    ]);
    setLaborItem(defaultLaborItem);
    setPopup("");
  }, [customer, laborItems, cost, mechanic, labor]);

  const onUpdateLabor = useCallback(async () => {
    setLaborItems((prev: CustomerLaborItem[]) => {
      (
        prev.find((s) => s.id === laborItem.id) ?? defaultLaborItem
      ).description = `Labor ${labor}`;
      (prev.find((s) => s.id === laborItem.id) ?? defaultLaborItem).cost =
        parseFloat(cost);
      (prev.find((s) => s.id === laborItem.id) ?? defaultLaborItem).laborer =
        mechanic;
      return [...prev];
    });
    setPopup("");
    await particularPOSStore.updateParticularPOS(`${laborItem.id}`, {
      remarks: `${mechanic} 0`,
      description: `Labor ${labor}`,
      unit_amount: parseFloat(cost),
    });
    setLaborItem(defaultLaborItem);
  }, [laborItem, laborItems, cost, mechanic, labor]);

  const onDeleteLabor = useCallback(async () => {
    setLaborItems((prev: CustomerLaborItem[]) => {
      prev.splice(
        prev.findIndex((s) => s.id === laborItem.id),
        1
      );
      return [...prev];
    });
    setPopup("");
    await particularPOSStore.deleteParticularPOS(`${laborItem.id}`);
    setLaborItem(defaultLaborItem);
  }, [laborItem, laborItems]);

  useEffect(() => {
    if (laborItem.id !== -1) {
      setLabor(laborItem.description.replace("Labor ", ""));
      setCost(laborItem.cost.toString());
      setMechanic(laborItem.laborer);
    } else {
      setLabor("Labor (Others)");
      setCost("0");
      setMechanic("DATS");
    }
  }, [popup]);

  return (
    <>
      <Overlay
        isVisible={popup === "labor"}
        onBackdropPress={() => setPopup("")}
      >
        <View style={styles.msgBox}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Text style={{ fontSize: 16 }}>
              {laborItem.id !== -1
                ? "Edit this transaction"
                : "Add Labor to this Transaction"}
            </Text>
            <Icon
              name={"close"}
              size={30}
              color={"gainsboro"}
              onPress={() => setPopup("")}
            />
          </View>

          <View
            style={{
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text>Assigned to: </Text>
            <SelectDropdown
              data={mechanics}
              onSelect={setMechanic}
              defaultValue={mechanic}
            />
          </View>
          <View
            style={{
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text>Select Labor: </Text>
            <SelectDropdown
              data={labors}
              onSelect={setLabor}
              defaultValue={labor}
            />
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingRight: 20,
            }}
          >
            <Text style={{ fontSize: 15, color: "grey" }}>Labor Cost:</Text>
            <TextInput
              style={{
                marginTop: -5,
                padding: 5,
                borderWidth: 1,
                width: 150,
                borderColor: "gainsboro",
                fontSize: 15,
                height: 30,
                textAlign: "right",
              }}
              value={cost}
              keyboardType="numeric"
              onChangeText={(amt) =>
                setCost(
                  (isNaN(parseFloat(amt.replace(/[^.0-9]/g, "")))
                    ? ""
                    : amt.replace(/[^.0-9]/g, "")
                  ).toString()
                )
              }
            />
          </View>
          <View
            style={{
              flexDirection: "row-reverse",
              justifyContent: "space-between",
            }}
          >
            <Icon
              name={"check"}
              size={40}
              color={"gainsboro"}
              onPress={laborItem.id !== -1 ? onUpdateLabor : onCreateLabor}
            />
            {laborItem.id !== -1 && (
              <Icon
                name={"delete"}
                size={40}
                color={"gainsboro"}
                onPress={onDeleteLabor}
                delayPressIn={0}
              />
            )}
          </View>
        </View>
      </Overlay>
    </>
  );
};

const styles = StyleSheet.create({
  msgBox: {
    height: 300,
    width: 300,
    justifyContent: "space-between",
  },
});
