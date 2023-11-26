import { observer } from "mobx-react-lite";
import moment from "moment";
import { MyCard } from "../blueprints/MyCard";
import { LaborItem } from "../stores/LaborItemStore";
import { Sale } from "../stores/SalesStore";
import { useStore } from "../stores/Store";

type Item = {
  sale: Sale;
  labor: LaborItem;
};

export const MechLaborCard = observer(
  (props: { hidden?: boolean; item: Item; locked?: boolean }) => {
    const { item, hidden, locked } = props;
    const { saleStore, mechanicStore, transactionStore } = useStore();

    const onPressPayments = () => {
      if (item.labor.amount_owed === item.labor.amount_returned) return;
      transactionStore.addItem({
        description: `Labor Compensate for Sale # ${item.sale.id} - M${item.labor.mechanic}`,
        amount: item.labor.amount_owed,
        category: 1,
        transmitter: 10,
        receiver: 14,
      });
      saleStore.updateItemParticularLabor(
        {
          amount_returned: item.labor.amount_owed,
        },
        item.labor.sales,
        item.labor.id
      );
    };

    return (
      <>
        <MyCard
          disabled={locked}
          item={item.labor}
          details={[
            {
              id: 1,
              text: `${item.labor.labor_name} (${item.labor.amount_returned}/${item.labor.amount_owed})`,
              type: "main",
            },
            {
              id: 2,
              text: `Customer: ${item.sale.customer_name}`,
              type: "sub",
            },
            {
              id: 3,
              text: `${moment(new Date(item.labor.datetime_added)).format(
                "h:mm A"
              )}${
                item.labor.datetime_done
                  ? " - " +
                    moment(new Date(item.labor.datetime_done)).format("h:mm A")
                  : ""
              }`,
              type: "sub",
            },
          ]}
          price={item.labor.amount_received}
          hidden={hidden}
          actions={[
            {
              id: 1,
              name: "payments",
              position: "Q5",
              color:
                item.labor.amount_returned === item.labor.amount_owed
                  ? "goldenrod"
                  : "gray",
              onPress: () => !locked && onPressPayments(),
            },
          ]}
          quantity={1}
          unit={`\u00d7`}
        />
      </>
    );
  }
);
