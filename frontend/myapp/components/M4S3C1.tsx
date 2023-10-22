import { useContext, useEffect, useState } from "react";
import { Text, View } from "react-native";
import { M4S3Context } from "../constants/interfaces";
import { useStore } from "../stores/Store";

export const AccountsView = (props: { visible: boolean }) => {
  const { accountStore, transactionStore, particularPOSStore, categoryStore } =
    useStore();
  const values = {};

  return (
    props.visible && (
      <M4S3Context.Provider value={values}>
        <Text>Accounts View</Text>
      </M4S3Context.Provider>
    )
  );
};
