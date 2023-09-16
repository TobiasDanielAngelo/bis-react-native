import { useContext, useEffect, useState } from "react";
import { Text, View, StyleSheet, TextInput } from "react-native";
import { Icon, Overlay } from "react-native-elements";
import SelectDropdown from "react-native-select-dropdown";
import { CustomerLaborItem, POSContext } from "../../interfaces/interfaces";

export const AddLaborItemOverlay = (props: any) => {
  const { customer, laborItem, laborItems } = useContext(POSContext);

  const [cost, setCost] = useState("0");
  const [mechanic, setMechanic] = useState("DATS");
  const [labor, setLabor] = useState("Rebore");
  const mechanics = [
    "DATS",
    "Aldo",
    "Reniel",
    "Ping",
    "Jervin",
    "Jomar",
    "Others",
  ];

  const labors = [
    "Labor (Others)",
    "Rebore",
    "Press",
    "Tire Changer",
    "Overhaul",
    "Torno",
    "Asinta",
    "Palit Gulong",
    "Change Oil",
    "Honing",
    "Rimatse",
    "General",
  ];

  useEffect(() => {
    if (laborItem !== -1) {
      setLabor(
        laborItems
          .find((s) => s.id === laborItem && s.custId === customer)
          ?.description.split(", ")[1] ?? "Labor (Others)"
      );
      setCost(
        laborItems
          .find((s) => s.id === laborItem && s.custId === customer)
          ?.cost.toString() ?? "0"
      );
      setMechanic(
        laborItems.find((s) => s.id === laborItem && s.custId === customer)
          ?.laborer ?? "DATS"
      );
    } else {
      setLabor("Labor (Others)");
      setCost("0");
      setMechanic("DATS");
    }
  }, [props.visible]);

  const handleCheck = () => {
    const randNum = Math.round(1000 * Math.random());

    const item = {
      id: -1,
      custId: customer,
      laborer: mechanic,
      description: `Labor${randNum}, ${labor}`,
      cost: parseFloat(cost),
      paid: "not paid",
      collected: 0,
    } as CustomerLaborItem;
    props.handleAddLaborSubmit(item, randNum);
    props.setVisible(false);
  };

  const handleUpdateCheck = () => {
    props.handleEditLaborSubmit(mechanic, labor, cost);
    props.setVisible(false);
  };

  return (
    <>
      <Overlay
        isVisible={props.visible}
        onBackdropPress={() => props.setVisible(false)}
      >
        <View style={styles.msgBox}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Text style={{ fontSize: 16 }}>
              {laborItems.map((s) => s.id).includes(laborItem)
                ? "Edit this transaction"
                : "Add Labor to this Transaction"}
            </Text>
            <Icon
              name={"close"}
              size={30}
              color={"#aaa"}
              onPress={() => props.setVisible(false)}
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
              onSelect={(selectedItem: string) => setMechanic(selectedItem)}
              defaultValue={
                laborItems.find(
                  (s) => s.id === laborItem && s.custId === customer
                )?.laborer ?? "DATS"
              }
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
              onSelect={(selectedItem: string) => setLabor(selectedItem)}
              defaultValue={
                laborItems
                  .find((s) => s.id === laborItem && s.custId === customer)
                  ?.description.split(", ")[1] ?? "Labor (Others)"
              }
            />
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingRight: 20,
            }}
          >
            <Text style={{ fontSize: 15, color: "#888" }}>Labor Cost:</Text>
            <TextInput
              style={{
                marginTop: -5,
                padding: 5,
                borderWidth: 1,
                width: 150,
                borderColor: "#aaa",
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
              color={"#aaa"}
              onPress={
                laborItems.map((s) => s.id).includes(laborItem)
                  ? handleUpdateCheck
                  : handleCheck
              }
            />
            {laborItems.map((s) => s.id).includes(laborItem) && (
              <Icon
                name={"delete"}
                size={40}
                color={"#aaa"}
                onPress={() => {
                  props.handleDelete();
                  props.setVisible(false);
                }}
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
