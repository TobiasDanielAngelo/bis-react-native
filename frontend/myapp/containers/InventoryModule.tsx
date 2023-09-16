import {
  StyleSheet,
  View,
  SafeAreaView,
  Text,
  TouchableOpacity,
} from "react-native";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { useStore } from "../stores/Store";

export const InventoryModule = observer(() => {
  const { transactionStore } = useStore();
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);

  const toggleRefresh = () => {
    setRefresh((r) => !r);
  };

  const getInfo = async () => {
    try {
      setLoading(true);
      await transactionStore.fetchTransactions("incomes");
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  };

  useEffect(() => {
    getInfo();
  }, [refresh]);

  const incomes = transactionStore.transactions;
  return (
    <SafeAreaView>
      <Text style={{ backgroundColor: "yellow", fontSize: 30 }}>
        {loading ? "Loading" : "Not Loading"}
      </Text>

      {incomes.map((s) => (
        <View key={s.pk}>
          <Text>
            {s.transmitter}
            {s.description} -
            {s.particular_transaction.map((s) => s.description)}
          </Text>
        </View>
      ))}
      <TouchableOpacity onPress={toggleRefresh}>
        <Text>Refresh</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({});
