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
import { Transaction } from "../stores/TransactionStore";
import { Payable } from "../stores/PayableStore";
import { Receivable } from "../stores/ReceivableStore";
import { TransactionCard } from "./TransactionCard";
import { ReceivableCard } from "./ReceivableCard";
import { PayableCard } from "./PayableCard";

type Item = Transaction | Payable | Receivable;

interface Section {
  title: string;
  data: Item[];
  type: string;
}

export const TransactionsList = observer(
  (props: {
    expenses?: Transaction[];
    incomes?: Transaction[];
    receivables?: Receivable[];
    payables?: Payable[];
    hidden?: boolean;
  }) => {
    const { hidden, expenses, receivables, payables, incomes } = props;

    const data = [
      {
        title: "Expenses",
        data:
          expenses?.sort((a, b) =>
            new Date(a.datetime_transacted).getTime() >
            new Date(b.datetime_transacted).getTime()
              ? -1
              : 1
          ) ?? [],
        type: "transaction",
      },
      {
        title: "Other Incomes",
        data:
          incomes?.sort((a, b) =>
            new Date(a.datetime_transacted).getTime() >
            new Date(b.datetime_transacted).getTime()
              ? -1
              : 1
          ) ?? [],
        type: "transaction",
      },
      {
        title: "Payables",
        data:
          payables?.sort((a, b) =>
            new Date(a.datetime_opened).getTime() >
            new Date(b.datetime_opened).getTime()
              ? -1
              : 1
          ) ?? [],
        type: "payable",
      },
      {
        title: "Receivables",
        data:
          receivables?.sort((a, b) =>
            new Date(a.datetime_opened).getTime() >
            new Date(b.datetime_opened).getTime()
              ? -1
              : 1
          ) ?? [],
        type: "receivable",
      },
    ];

    const renderItem: SectionListRenderItem<Item, Section> = ({
      item,
      section,
    }) => {
      if (section.type === "transaction") {
        return (
          <TransactionCard item={item as Transaction} key={item.id + 1000} />
        );
      } else if (section.type === "receivable") {
        return (
          <ReceivableCard item={item as Receivable} key={item.id + 2000} />
        );
      } else {
        return <PayableCard item={item as Payable} key={item.id + 3000} />;
      }
    };
    return (
      !hidden && (
        <SectionList
          sections={data}
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
