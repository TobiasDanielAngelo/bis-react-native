import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import { SectionList, SectionListRenderItem } from "react-native";
import { MyText } from "../blueprints/MyText";
import { LaborItem } from "../stores/LaborItemStore";
import { SalesItem } from "../stores/SalesItemStore";
import { SaleInterface } from "../stores/SalesStore";
import { LaborCard } from "./LaborCard";
import { SalesCard } from "./SalesCard";

type Item = SalesItem | LaborItem;

interface Section {
  title: string;
  data: Item[];
  type: string;
}

export const SalesAndLaborList = observer(
  (props: { sale?: SaleInterface; hidden?: boolean }) => {
    const { sale, hidden } = props;

    console.log(sale?.sales_item?.map((s) => s.is_claimed));

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
      ],
      [sale?.sales_item, sale?.labor_item]
    );

    const renderItem: SectionListRenderItem<Item, Section> = ({
      item,
      section,
    }) => {
      if (section.type === "sales") {
        return (
          <SalesCard item={item as SalesItem} locked={sale?.status !== "1"} />
        );
      } else if (section.type === "labor") {
        return (
          <LaborCard item={item as LaborItem} locked={sale?.status !== "1"} />
        );
      } else {
        return <></>;
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
