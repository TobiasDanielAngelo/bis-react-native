import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { MyCard } from "../blueprints/MyCard";
import { MyDropdownPicker } from "../blueprints/MyDropdownPicker";
import { MyOverlay } from "../blueprints/MyOverlay";
import { MyTextInput } from "../blueprints/MyTextInput";
import { labors } from "../constants/constants";
import { LaborItem } from "../stores/LaborItemStore";
import { useStore } from "../stores/Store";
import { laborDueToMechanic, toNumString } from "../constants/helpers";

export const LaborCard = observer(
  (props: {
    hidden?: boolean;
    item: LaborItem;
    locked?: boolean;
    noActions?: boolean;
  }) => {
    const { item, hidden, locked, noActions } = props;
    const { saleStore, mechanicStore } = useStore();
    const [value, setValue] = useState(item.amount_received.toString());
    const [edit, setEdit] = useState(false);
    const [labor, setLabor] = useState(-1);
    const [mechanic, setMechanic] = useState(-1);

    const onChangeValue = (qty: string) => {
      let quantity = toNumString(qty);
      setValue(quantity);
    };

    const onPressCheck = async () => {
      if (isNaN(parseFloat(value))) return;
      if (parseFloat(value) === 0) {
        onPressClose();
        return;
      }
      await saleStore.updateItemParticularLabor(
        {
          amount_returned:
            labors.find((s, ind) => ind === labor) !== item.labor_name
              ? 0
              : item.amount_returned,
          amount_owed: laborDueToMechanic(
            labors.find((s, ind) => ind === labor) ?? "",
            parseFloat(value)
          ),
          amount_received: parseFloat(value),
          labor_name: labors.find((s, ind) => ind === labor),
        },
        item.sales,
        item.id
      );
    };

    const mechanicName = mechanicStore.getItem(item.mechanic)?.name;

    const onPressStar = async () => {
      await saleStore.updateItemParticularLabor(
        { is_done: !item.is_done },
        item.sales,
        item.id
      );
    };

    const onPressClose = async () => {
      await saleStore.deleteItemParticularLabor(item.sales, item.id);
    };

    useEffect(() => {
      setLabor(labors.findIndex((s) => s === item.labor_name));
      setMechanic(mechanicStore.getItem(item.mechanic)?.id ?? -1);
    }, []);

    return (
      <>
        <MyOverlay
          title="Edit Labor Details"
          isVisible={edit}
          setVisible={setEdit}
          onPressCheck={onPressCheck}
        >
          <MyDropdownPicker
            items={labors.map((s, ind) => ({
              value: ind,
              label: s,
            }))}
            label="Labor"
            value={labor}
            setValue={setLabor}
          />
          <MyDropdownPicker
            items={mechanicStore.mechanics.map((s, ind) => ({
              value: s.id,
              label: s.name,
            }))}
            label="Mechanic"
            value={mechanic}
            setValue={setMechanic}
          />
          <MyTextInput
            value={value}
            onChangeValue={onChangeValue}
            label="Labor Cost"
            numeric
            centered
          />
        </MyOverlay>
        <MyCard
          disabled={locked}
          item={item}
          details={[
            {
              id: 1,
              text: item.labor_name,
              type: "main",
            },
            {
              id: 2,
              text: `${mechanicName} (${item.amount_returned}/${item.amount_owed})`,
              type: "sub",
            },
          ]}
          price={item.amount_received}
          hidden={hidden}
          actions={
            noActions
              ? []
              : [
                  {
                    id: 1,
                    name: "star",
                    position: "Q5",
                    color: item.is_done ? "goldenrod" : "gray",
                    onPress: onPressStar,
                  },
                  {
                    id: 2,
                    name: "edit",
                    position: "Q4",
                    onPress: () => !locked && setEdit((t) => !t),
                  },
                  {
                    id: 4,
                    name: "close",
                    position: "Q6",
                    onPress: () => !locked && onPressClose(),
                  },
                ]
          }
          quantity={1}
          unit={`\u00d7`}
        />
      </>
    );
  }
);
