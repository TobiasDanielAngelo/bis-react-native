import { useContext, useEffect, useState } from "react";
import { M4S1Context } from "../constants/interfaces";
import { Text, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { TransferItem } from "./M4S1U1";

export const TransfersList = () => {
  const { transfers } = useContext(M4S1Context);

  return (
    <View style={{ flex: 1, justifyContent: "space-between" }}>
      <FlatList
        data={transfers.sort(
          (a, b) =>
            new Date(b.datetime_transacted).getTime() -
            new Date(a.datetime_transacted).getTime()
        )}
        renderItem={({ item }) => <TransferItem transfer={item} />}
      />
    </View>
  );
};
