import { FlatList } from "react-native";
import { MyList } from "../blueprints/MyList";
import { SaleInterface } from "../stores/SalesStore";
import { SalesCard } from "./SalesCard";

export const SalesList = (props: {
  sale?: SaleInterface;
  hidden?: boolean;
}) => {
  const { sale, hidden } = props;
  return (
    <MyList headNote="Sales" hidden={hidden}>
      <FlatList
        data={sale?.sales_item}
        renderItem={({ item }) => (
          <SalesCard item={item} locked={sale?.status !== "1"} />
        )}
        keyboardShouldPersistTaps="always"
        removeClippedSubviews={false}
      />
    </MyList>
  );
};
