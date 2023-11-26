import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import { SectionList, SectionListRenderItem } from "react-native";
import { MyText } from "../blueprints/MyText";
import { SalesItem } from "../stores/SalesItemStore";
import { ReturnCard } from "./ReturnCard";

type Item = SalesItem;

interface Section {
  title: string;
  data: Item[];
}

export const ReturnList = observer(
  (props: {
    items?: SalesItem[];
    hidden?: boolean;
    title: string;
    locked?: boolean;
  }) => {
    const { items, hidden, title, locked } = props;

    const data = useMemo(
      () => [
        {
          title: title,
          data: items ?? [],
        },
      ],
      [items, title]
    );

    const renderItem: SectionListRenderItem<Item, Section> = ({
      item,
      section,
    }) => {
      return <ReturnCard item={item as SalesItem} locked={locked} />;
    };
    return (
      !hidden && (
        <SectionList
          sections={data}
          keyExtractor={(item, index) => (item.id + index).toString()}
          renderItem={renderItem}
          renderSectionHeader={({ section: { title, data } }) => (
            <MyText text={title} size="medium" />
          )}
          keyboardShouldPersistTaps="always"
        />
      )
    );
  }
);
