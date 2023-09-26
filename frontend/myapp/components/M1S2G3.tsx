import { Text, View } from "react-native";
import { CustomerLaborItem, M1S2Context } from "../constants/interfaces";
import { useContext } from "react";
import { TouchableOpacity } from "react-native-gesture-handler";
import { LaborRedeemItem } from "./M1S2U1";

export const MechanicLaborCategorizedItems = (props: {
  title: string;
  visible: boolean;
  laborItems: CustomerLaborItem[];
  keyword: string;
  disabled: boolean;
  onPress?: (t: CustomerLaborItem) => void;
  onLongPress?: (t: CustomerLaborItem) => void;
}) => {
  const { customers } = useContext(M1S2Context);
  return (
    <View>
      <Text
        style={{
          margin: 10,
          fontSize: 20,
          display: props.visible ? "flex" : "none",
        }}
      >
        {props.title}
      </Text>
      {props.laborItems.map((s) => (
        <TouchableOpacity
          key={`${props.keyword}-${s.id}`}
          disabled={props.disabled}
          onPress={() => props.onPress && props.onPress(s)}
          onLongPress={() => props.onLongPress && props.onLongPress(s)}
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
    </View>
  );
};
