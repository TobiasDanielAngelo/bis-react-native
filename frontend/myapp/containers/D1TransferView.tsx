import { observer } from "mobx-react-lite";
import moment from "moment";
import { useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { HView } from "../blueprints/HView";
import { MyButton } from "../blueprints/MyButton";
import { MyDropdownPicker } from "../blueprints/MyDropdownPicker";
import { MyForm } from "../blueprints/MyForm";
import { MyList } from "../blueprints/MyList";
import { MyStatusBar } from "../blueprints/MyStatusBar";
import { MyTextInput } from "../blueprints/MyTextInput";
import { BalanceCard } from "../components/BalanceCard";
import { TransferCard } from "../components/TransferCard";
import { toNumString, toNumber } from "../constants/helpers";
import { useStore } from "../stores/Store";
import { MyOverlay } from "../blueprints/MyOverlay";
import { MyIcon } from "../blueprints/MyIcon";

const defaultDetails = {
  transmitter: -1,
  receiver: -1,
  amount: "",
  category: 48,
  description: "",
};
export const D1TransferView = observer((props: { isVisible?: boolean }) => {
  const { isVisible } = props;

  const { transactionStore, accountStore } = useStore();
  const [screen1, setScreen1] = useState(false);
  const [screen2, setScreen2] = useState(false);
  const [details, setDetails] = useState(defaultDetails);
  const [isVisible1, setVisible1] = useState(false);
  const [account, setAccount] = useState("");

  const account1Choices = accountStore.accounts.filter(
    (s) => s.id !== details.receiver && ![14, 16].includes(s.id)
  );
  const account2Choices = accountStore.accounts.filter(
    (s) => s.id !== details.transmitter && ![14, 16].includes(s.id)
  );

  const onChangeAmount = (t: string) => {
    setDetails({ ...details, amount: toNumString(t, true) });
  };

  const onChangeTransmitter = (t: number) => {
    setDetails({ ...details, transmitter: t });
  };

  const onChangeReceiver = (t: number) => {
    setDetails({ ...details, receiver: t });
  };

  const onChangeDescription = (t: string) => {
    setDetails({ ...details, description: t });
  };

  const onPressBtn2 = () => {
    setDetails(defaultDetails);
  };

  const onPressTransfers = () => {
    setScreen1((t) => !t);
    setScreen2(false);
  };

  const onPressBalance = () => {
    setScreen2((t) => !t);
    setScreen1(false);
  };

  const noBtn =
    details.transmitter === -1 ||
    details.receiver === -1 ||
    toNumber(details.amount) === 0 ||
    isNaN(parseFloat(details.amount));

  const transfersToday = transactionStore.transactions
    .filter((s) => s.category === 48)
    .filter(
      (s) =>
        moment(new Date(s.datetime_transacted)).format("MMDDYY") ===
        moment(new Date()).format("MMDDYY")
    );

  const onPressTransfer = () => {
    transactionStore.addItem({
      ...details,
      description:
        details.description === ""
          ? `Transfer from ${
              accountStore.getItem(details.transmitter)?.name
            } to ${accountStore.getItem(details.receiver)?.name}`
          : details.description,
      amount: parseFloat(details.amount),
    });
    setDetails(defaultDetails);
  };

  const onPressAdd = () => {
    if (account === "") return;
    accountStore.addItem({
      name: account.toUpperCase(),
    });
  };

  return (
    isVisible && (
      <View style={styles.main}>
        <View style={styles.body}>
          <MyOverlay
            title="Add New Account"
            isVisible={isVisible1}
            setVisible={setVisible1}
            onPressCheck={onPressAdd}
          >
            <MyTextInput
              label="Account name"
              value={account}
              onChangeValue={setAccount}
            />
          </MyOverlay>
          <HView>
            <MyButton
              label={!screen1 ? "Transfers" : "New Transfer"}
              flex
              onPress={onPressTransfers}
              hidden={screen2}
            />
            <MyButton
              label={!screen2 ? "See Balance" : "New Transfer"}
              flex
              onPress={onPressBalance}
              hidden={screen1}
            />
          </HView>
          <MyForm
            noBtn1={noBtn}
            btn1Label="Transfer"
            btn2Label="Clear"
            onPressBtn1={onPressTransfer}
            onPressBtn2={onPressBtn2}
            hidden={screen1 || screen2}
          >
            <HView>
              <MyDropdownPicker
                items={account1Choices.map((s) => ({
                  value: s.id,
                  label: s.name,
                }))}
                value={details.transmitter}
                setValue={onChangeTransmitter}
                label="From..."
                flex
              />
              <MyIcon
                name="add"
                label="New"
                onPress={() => setVisible1(true)}
              />
            </HView>
            <MyDropdownPicker
              items={account2Choices.map((s) => ({
                value: s.id,
                label: s.name,
              }))}
              value={details.receiver}
              setValue={onChangeReceiver}
              label="To..."
            />

            <MyTextInput
              label="Amount"
              value={details.amount}
              onChangeValue={onChangeAmount}
              numeric
              centered
            />
            <MyTextInput
              label="Note (Optional)"
              value={details.description}
              onChangeValue={onChangeDescription}
            />
          </MyForm>
          <MyList hidden={!screen1} headNote="Today's Transfers">
            <FlatList
              data={transfersToday}
              renderItem={({ item }) => <TransferCard item={item} />}
            />
          </MyList>
          <MyList hidden={!screen2} headNote="Account Balance">
            <FlatList
              data={accountStore.accounts}
              renderItem={({ item }) => <BalanceCard item={item} />}
            />
          </MyList>
        </View>
        <MyStatusBar
          action1={{
            name: "refresh",
            onPress: () => accountStore.fetchAll(),
          }}
        />
      </View>
    )
  );
});

const styles = StyleSheet.create({
  main: {
    flex: 1,
  },
  body: {
    flex: 1,
  },
  bar: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
});
