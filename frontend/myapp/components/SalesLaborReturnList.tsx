import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import { SectionList, SectionListRenderItem } from "react-native";
import { MyText } from "../blueprints/MyText";
import { LaborItem } from "../stores/LaborItemStore";
import { ReturnedItem } from "../stores/ReturnedItemStore";
import { SalesItem } from "../stores/SalesItemStore";
import { SaleInterface } from "../stores/SalesStore";
import { LaborCard } from "./LaborCard";
import { ReturnedCard } from "./ReturnedCard";
import { SalesCard } from "./SalesCard";

type Item = SalesItem | LaborItem | ReturnedItem;

interface Section {
  title: string;
  data: Item[];
  type: string;
}

export const SalesLaborReturnList = observer(
  (props: { sale?: SaleInterface; hidden?: boolean }) => {
    const { sale, hidden } = props;

    const data = useMemo(
      () => [
        {
          title: "Labor",
          data: sale?.labor_item ?? [],
          type: "labor",
        },
        {
          title: "Sales",
          data: sale?.sales_item ?? [],
          type: "sales",
        },
        {
          title: "Returned",
          data: sale?.returned_item ?? [],
          type: "return",
        },
      ],
      [sale?.sales_item, sale?.labor_item, sale?.returned_item]
    );

    const renderItem: SectionListRenderItem<Item, Section> = ({
      item,
      section,
    }) => {
      if (section.type === "sales") {
        return <SalesCard item={item as SalesItem} locked noActions />;
      } else if (section.type === "labor") {
        return <LaborCard item={item as LaborItem} locked noActions />;
      } else {
        return <ReturnedCard item={item as SalesItem} locked />;
      }
    };
    return (
      !hidden && (
        <SectionList
          sections={data}
          keyExtractor={(item, index) => (item.id + index).toString()}
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
