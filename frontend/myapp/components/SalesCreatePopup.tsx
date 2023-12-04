import { useCallback, useState, useEffect } from "react";
import { MyOverlay } from "../blueprints/MyOverlay";
import { MyTextInput } from "../blueprints/MyTextInput";
import { randomNameGen } from "../constants/helpers";
import { useStore } from "../stores/Store";
import moment from "moment";

export const SalesCreatePopup = (props: {
  isVisible: boolean;
  setVisible: (t: boolean) => void;
  setSelectedItem: React.Dispatch<React.SetStateAction<number>>;
}) => {
  const { isVisible, setVisible, setSelectedItem } = props;
  const { saleStore } = useStore();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");

  const onPressShuffle = useCallback(() => {
    let nameAddress = randomNameGen(true);
    setName(`${Math.round(300 * Math.random())} Cash`);
    setAddress(nameAddress[1]);
  }, []);

  const onPressCheck = async () => {
    const resp = await saleStore.addItem(`${name} (${address})`);
    if (!resp.data) return;
    setSelectedItem(resp.data.id);
  };

  useEffect(() => {
    if (isVisible) {
      setName("");
      setAddress("");
    }
  }, [isVisible]);

  return (
    <MyOverlay
      title="Add a Customer"
      onPressCheck={onPressCheck}
      isVisible={isVisible}
      setVisible={setVisible}
      actionLogo1="shuffle"
      onPressAction1={onPressShuffle}
    >
      <MyTextInput
        label="Name of Customer"
        value={name}
        onChangeValue={setName}
      />
      <MyTextInput
        label="Address of Customer"
        value={address}
        onChangeValue={setAddress}
      />
    </MyOverlay>
  );
};
