import { useContext, useCallback } from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import {
  CustomerLaborItem,
  RedeemContext,
} from "../../../constants/interfaces";
import { formatDate, laborDueToMechanic } from "../../../constants/helpers";
import { LaborRedeemItem } from "../units/LaborRedeemItem";
import { useStore } from "../../../stores/Store";
import { defaultLaborItem } from "../../../constants/constants";

export const MechanicLaborItems = () => {
  const { laborItems, customers, laborer, laborItem, setLaborItems } =
    useContext(RedeemContext);
  const { particularPOSStore } = useStore();

  const handleGiven = useCallback(
    async (laborId: number, collected: number, laborer: string) => {
      await particularPOSStore.updateParticularPOS(`${laborId}`, {
        remarks: `${laborer} ${collected}`,
      });

      setLaborItems((prev: CustomerLaborItem[]) => {
        (prev.find((s) => s.id === laborId) ?? defaultLaborItem).collected =
          collected;
        return [...prev];
      });
    },
    [laborItems]
  );

  return (
    <>
      <Text
        style={{
          margin: 10,
          fontSize: 20,
        }}
      >
        {laborer}
      </Text>
      <Text
        style={{
          margin: 10,
          fontSize: 20,
          display:
            laborItems.filter(
              (s) =>
                s.laborer === laborer &&
                customers.find((u) => u.id === s.custId)?.paymentStatus !==
                  "paid"
            ).length > 0
              ? "flex"
              : "none",
        }}
      >
        Customer Not Paid / Validating
      </Text>
      {laborItems
        .filter(
          (s) =>
            s.laborer === laborer &&
            customers.find((u) => u.id === s.custId)?.paymentStatus !== "paid"
        )
        .map((s) => (
          <TouchableOpacity key={`laborunpaid-${s.id}`} disabled={true}>
            <Text>{s.description}</Text>
            <LaborRedeemItem
              description={s.description.split(" ")[1]}
              laborer={s.laborer}
              cost={s.cost}
              collected={s.collected}
              paid={
                customers.find((u) => u.id === s.custId)?.paymentStatus ??
                "not paid"
              }
              customer={customers.find((u) => u.id === s.custId)?.name ?? ""}
              date={
                customers.find((u) => u.id === s.custId)?.dateTransacted ?? ""
              }
            />
          </TouchableOpacity>
        ))}
      <Text
        style={{
          margin: 10,
          fontSize: 20,
          display:
            laborItems.filter(
              (s) =>
                s.laborer === laborer &&
                s.collected !==
                  laborDueToMechanic(
                    s.description.split(" ")[1],
                    parseFloat(`${s.cost}`)
                  ) &&
                customers.find((u) => u.id === s.custId)?.paymentStatus ===
                  "paid"
            ).length > 0
              ? "flex"
              : "none",
        }}
      >
        Not collected
      </Text>
      {laborItems
        .filter(
          (s) =>
            s.laborer === laborer &&
            s.collected !==
              laborDueToMechanic(
                s.description.split(" ")[1],
                parseFloat(`${s.cost}`)
              ) &&
            customers.find((u) => u.id === s.custId)?.paymentStatus === "paid"
        )
        .map((s) => (
          <TouchableOpacity
            key={`uncollected-${s.id}`}
            onPress={() => {
              handleGiven(
                s.id,
                laborDueToMechanic(
                  s.description.split(" ")[1],
                  parseFloat(`${s.cost}`)
                ),
                s.laborer
              );
            }}
          >
            <LaborRedeemItem
              description={s.description.split(" ")[1]}
              laborer={s.laborer}
              cost={s.cost}
              collected={s.collected}
              paid={
                customers.find((u) => u.id === s.custId)?.paymentStatus ??
                "not paid"
              }
              customer={customers.find((u) => u.id === s.custId)?.name ?? ""}
              date={
                customers.find((u) => u.id === s.custId)?.dateTransacted ?? ""
              }
            />
          </TouchableOpacity>
        ))}
      <Text
        style={{
          margin: 10,
          fontSize: 20,
          display:
            laborItems.filter(
              (s) =>
                s.laborer === laborer &&
                s.collected ===
                  laborDueToMechanic(
                    s.description.split(" ")[1],
                    parseFloat(`${s.cost}`)
                  ) &&
                formatDate(
                  new Date(
                    customers.find((t) => t.id === s.custId)?.dateTransacted ??
                      ""
                  )
                ) === formatDate(new Date())
            ).length > 0
              ? "flex"
              : "none",
        }}
      >
        Collected
      </Text>
      {laborItems
        .filter(
          (s) =>
            s.laborer === laborer &&
            s.collected ===
              laborDueToMechanic(
                s.description.split(" ")[1],
                parseFloat(`${s.cost}`)
              ) &&
            formatDate(
              new Date(
                customers.find((t) => t.id === s.custId)?.dateTransacted ?? ""
              )
            ) === formatDate(new Date())
        )
        .map((s) => (
          <TouchableOpacity
            key={`laborpaid-${s.id}`}
            onLongPress={() => {
              s.collected !==
              laborDueToMechanic(
                s.description.split(" ")[1],
                parseFloat(`${s.cost}`)
              )
                ? handleGiven(
                    s.id,
                    laborDueToMechanic(
                      s.description.split(" ")[1],
                      parseFloat(`${s.cost}`)
                    ),
                    s.laborer
                  )
                : handleGiven(s.id, 0, s.laborer);
            }}
          >
            <LaborRedeemItem
              description={s.description.split(" ")[1]}
              laborer={s.laborer}
              cost={s.cost}
              collected={s.collected}
              paid={
                customers.find((u) => u.id === s.custId)?.paymentStatus ??
                "not paid"
              }
              customer={customers.find((u) => u.id === s.custId)?.name ?? ""}
              date={
                customers.find((u) => u.id === s.custId)?.dateTransacted ?? ""
              }
            />
          </TouchableOpacity>
        ))}
    </>
  );
};

const styles = StyleSheet.create({});
