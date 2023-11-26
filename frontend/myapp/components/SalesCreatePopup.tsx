import { useCallback, useState } from "react";
import { MyOverlay } from "../blueprints/MyOverlay";
import { MyTextInput } from "../blueprints/MyTextInput";
import { randomNameGen } from "../constants/helpers";
import { useStore } from "../stores/Store";

export const SalesCreatePopup = (props: {
  isVisible: boolean;
  setVisible: (t: boolean) => void;
}) => {
  const { isVisible, setVisible } = props;
  const { saleStore } = useStore();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");

  const onPressShuffle = useCallback(() => {
    let nameAddress = randomNameGen(true);
    setName(nameAddress[0]);
    setAddress(nameAddress[1]);
  }, []);

  const onPressCheck = async () => {
    await saleStore.addItem(`${name} (${address})`);
  };

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
