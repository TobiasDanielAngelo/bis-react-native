import { useContext, useEffect, useState } from "react";
import { Text, View } from "react-native";
import { M4S4Context } from "../constants/interfaces";
import { useStore } from "../stores/Store";
import { Icon } from "react-native-elements";

export const ForecastView = (props: { visible: boolean }) => {
  const values = {};

  return (
    props.visible && (
      <M4S4Context.Provider value={values}>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Icon name="hourglass-top" size={50} color="teal" />
          <Text style={{ fontSize: 25, color: "gray", textAlign: "center" }}>
            Forecast feature will be available on the next update. Stay tuned!
          </Text>
          <Text style={{ color: "gray", textAlign: "center" }}>
            ...for creating budgets, proposals, trends.
          </Text>
        </View>
      </M4S4Context.Provider>
    )
  );
};
