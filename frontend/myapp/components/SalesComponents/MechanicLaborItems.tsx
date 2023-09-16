import { StyleSheet, TouchableOpacity, Text } from "react-native";
import { useContext } from "react";
import { LaborRedeemItem } from "./LaborRedeemItem";
import { laborDueToMechanic } from "./PaymentValidationOverlay";
import { RedeemContext } from "../../interfaces/interfaces";
import { formatDate } from "../../containers/POSView";

export const MechanicLaborItems = (props: any) => {
  const { laborItems, customers, laborer, handleGiven } =
    useContext(RedeemContext);

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
                customers.find((u) => u.id === s.custId)?.paid !== "paid"
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
            customers.find((u) => u.id === s.custId)?.paid !== "paid"
        )
        .map((s) => (
          <TouchableOpacity
            key={`labor-${s.description}-${s.laborer}`}
            disabled={true}
          >
            <LaborRedeemItem
              description={s.description.split(", ")[1]}
              laborer={s.laborer}
              cost={s.cost}
              collected={s.collected}
              paid={
                customers.find((u) => u.id === s.custId)?.paid ?? "not paid"
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
                    s.description.split(", ")[1],
                    parseFloat(`${s.cost}`)
                  ) &&
                customers.find((u) => u.id === s.custId)?.paid === "paid"
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
                s.description.split(", ")[1],
                parseFloat(`${s.cost}`)
              ) &&
            customers.find((u) => u.id === s.custId)?.paid === "paid"
        )
        .map((s) => (
          <TouchableOpacity
            key={`labor-${s.description}-${s.laborer}`}
            onPress={() =>
              handleGiven(
                s.description,
                laborDueToMechanic(
                  s.description.split(", ")[1],
                  parseFloat(`${s.cost}`)
                ),
                s.custId
              )
            }
          >
            <LaborRedeemItem
              description={s.description.split(", ")[1]}
              laborer={s.laborer}
              cost={s.cost}
              collected={s.collected}
              paid={
                customers.find((u) => u.id === s.custId)?.paid ?? "not paid"
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
                    s.description.split(", ")[1],
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
                s.description.split(", ")[1],
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
            key={`labor-${s.description}-${s.laborer}`}
            onLongPress={() =>
              s.collected !==
              laborDueToMechanic(
                s.description.split(", ")[1],
                parseFloat(`${s.cost}`)
              )
                ? handleGiven(
                    s.description,
                    laborDueToMechanic(
                      s.description.split(", ")[1],
                      parseFloat(`${s.cost}`)
                    ),
                    s.custId
                  )
                : handleGiven(s.description, 0, s.custId)
            }
          >
            <LaborRedeemItem
              description={s.description.split(", ")[1]}
              laborer={s.laborer}
              cost={s.cost}
              collected={s.collected}
              paid={
                customers.find((u) => u.id === s.custId)?.paid ?? "not paid"
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
