import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { MyStatusBar } from "../blueprints/MyStatusBar";
import { SelectionBar } from "../blueprints/SelectionBar";
import { totalValue } from "../constants/helpers";
import { LaborList } from "../components/LaborList";
import { useStore } from "../stores/Store";

export const A2CompensateView = observer((props: { isVisible?: boolean }) => {
  const { isVisible } = props;

  const { mechanicStore, saleStore } = useStore();

  const [selectedItem, setSelectedItem] = useState(-1);
  const [refresh, setRefresh] = useState(0);

  const labors = saleStore.sales
    .map((s) => {
      return s.labor_item.map((t) => {
        return { sale: s, labor: t };
      });
    })
    .flat(1)
    .filter((s) => s.sale.is_active);

  const totalToReturn = totalValue(
    labors
      .filter((s) => s.labor.mechanic === selectedItem)
      .map((s) => s.labor.amount_owed - s.labor.amount_returned)
  );

  const getSales = useCallback(() => {
    saleStore.fetchAll({ isActive: true });
  }, []);

  useEffect(() => {
    getSales();
  }, [refresh]);

  return (
    isVisible && (
      <View style={styles.main}>
        <View style={styles.body}>
          <SelectionBar
            selectedItem={selectedItem}
            items={mechanicStore.mechanics.filter(
              (s) => labors.filter((t) => s.id === t.labor.mechanic).length > 0
            )}
            onPressItem={setSelectedItem}
            onPressRefresh={() => setRefresh((t) => t + 1)}
            hasNoAddBtn
          />
          <View style={styles.list}>
            <LaborList
              labors={labors.filter((s) => s.labor.mechanic === selectedItem)}
            />
          </View>
          <MyStatusBar amount={totalToReturn} hidden={totalToReturn <= 0} />
        </View>
      </View>
    )
  );
});
const styles = StyleSheet.create({
  main: {
    flex: 1,
  },
  body: {
    flex: 1,
  },
  list: {
    flex: 1,
    margin: 3,
  },
});
