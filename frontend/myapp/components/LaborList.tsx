import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import { SectionList, SectionListRenderItem } from "react-native";
import { MyText } from "../blueprints/MyText";
import { LaborItem } from "../stores/LaborItemStore";
import { Sale } from "../stores/SalesStore";
import { MechLaborCard } from "./MechLaborCard";

type Item = {
  sale: Sale;
  labor: LaborItem;
};

interface Section {
  title: string;
  data: Item[];
}

export const LaborList = observer(
  (props: { labors?: Item[]; hidden?: boolean }) => {
    const { labors, hidden } = props;

    const data = useMemo(
      () => [
        {
          title: "Unpaid",
          data: labors?.filter((s) => s.sale.status === "1") ?? [],
        },
        {
          title: "Processing",
          data: labors?.filter((s) => s.sale.status === "2") ?? [],
        },
        {
          title: "Paid",
          data: labors?.filter((s) => s.sale.status === "3") ?? [],
        },
      ],
      [labors]
    );

    const renderItem: SectionListRenderItem<Item, Section> = ({ item }) => {
      return <MechLaborCard item={item} locked={item.sale.status !== "3"} />;
    };
    return (
      !hidden && (
        <SectionList
          sections={data}
          keyExtractor={(item, index) => (item.labor.id + index).toString()}
          renderItem={renderItem}
          renderSectionHeader={({ section: { title, data } }) => {
            return data.length > 0 ? (
              <MyText text={title} size="medium" />
            ) : (
              <></>
            );
          }}
          keyboardShouldPersistTaps="always"
        />
      )
    );
  }
);
