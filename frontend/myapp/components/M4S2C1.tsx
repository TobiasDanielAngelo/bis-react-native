import { useContext, useEffect, useState } from "react";
import { Text, View } from "react-native";
import { M4S2Context } from "../constants/interfaces";
import { useStore } from "../stores/Store";

export const ReportView = (props: { visible: boolean }) => {
  const { accountStore, transactionStore, particularPOSStore, categoryStore } =
    useStore();

  useEffect(() => {}, []);

  const values = {};

  return (
    props.visible && (
      <M4S2Context.Provider value={values}>
        <Text>Report View</Text>
      </M4S2Context.Provider>
    )
  );
};
