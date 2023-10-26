import moment from "moment";
import { useEffect, useState, useCallback } from "react";
import { View } from "react-native";
import {
  AccountInterface,
  M4S1Context,
  TransactionInterface,
  Transfer,
} from "../constants/interfaces";
import { useStore } from "../stores/Store";
import { TransferForm } from "./M4S1P1";
import { TransfersList } from "./M4S1G1";

export const TransferView = (props: { visible: boolean }) => {
  const {
    accountStore,
    transactionStore,
    particularPOSStore,
    categoryStore,
    userStore,
  } = useStore();
  const [accounts, setAccounts] = useState<AccountInterface[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);

  const getAccounts = async () => {
    const resp = await accountStore.fetchAccounts();

    setAccounts(resp.data ?? []);
  };

  const getTransfersToday = async () => {
    const resp = await transactionStore.fetchTransactions(
      `transactions/?transfer=1&date=${moment(new Date()).format("YYYYMMDD")}`
    );
    setTransfers(
      resp.data?.map((s) => ({
        id: parseInt(s.pk ?? "-1"),
        datetime_transacted: s.datetime_transacted ?? "",
        transmitter: s.transmitter ?? "",
        receiver: s.receiver ?? "",
        amount:
          s.particular_transaction && s.particular_transaction.length > 0
            ? s.particular_transaction[0].unit_amount ?? 0
            : 0,
        encoder: s.encoder ?? "",
        message:
          s.particular_transaction && s.particular_transaction.length > 0
            ? s.particular_transaction[0].remarks ?? ""
            : "",
      })) ?? []
    );
  };

  const getCategories = useCallback(async () => {
    await categoryStore.fetchCategories();
  }, []);

  useEffect(() => {
    if (props.visible) {
      getAccounts();
      getTransfersToday();
      getCategories();
    }
  }, [props.visible]);

  const values = {
    accounts: accounts,
    setAccounts: setAccounts,
    transfers: transfers,
    setTransfers: setTransfers,
  };

  return (
    props.visible && (
      <M4S1Context.Provider value={values}>
        <View style={{ flex: 1, justifyContent: "space-between" }}>
          <TransferForm />
        </View>
        <TransfersList />
      </M4S1Context.Provider>
    )
  );
};
