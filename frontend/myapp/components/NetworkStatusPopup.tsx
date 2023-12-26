import { View } from "react-native";
import { Text } from "react-native-elements";
import { MyOverlay } from "../blueprints/MyOverlay";

export const NetworkStatusPopup = (props: {
  status: boolean;
  type: string;
}) => {
  const { status, type } = props;
  return (
    <MyOverlay
      title="Network Error"
      isVisible={!status}
      setVisible={() => {}}
      noBtns
    >
      <Text>No Internet Connection</Text>
    </MyOverlay>
  );
};
