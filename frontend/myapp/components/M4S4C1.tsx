import { useContext, useEffect, useState } from "react";
import { Text, View } from "react-native";
import { M4S4Context } from "../constants/interfaces";
import { useStore } from "../stores/Store";

export const ForecastView = (props: { visible: boolean }) => {
  const { accountStore, transactionStore, particularPOSStore, categoryStore } =
    useStore();
  const values = {};

  return (
    props.visible && (
      <M4S4Context.Provider value={values}>
        <Text>Forecast View</Text>
      </M4S4Context.Provider>
    )
  );
};
