import {
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from "@react-navigation/drawer";
import { useNavigate } from "react-router-native";
import { useStore } from "../../stores/Store";

export const DrawerActions = (props: any) => {
  const navigate = useNavigate();
  const { userStore } = useStore();

  const logoutUser = async () => {
    const response = await userStore.logoutUser();
    if (!response.ok) {
      return;
    }
    navigate("/login");
  };

  return (
    <DrawerContentScrollView>
      <DrawerItemList {...props} />
      <DrawerItem label="Logout" onPress={logoutUser} />
    </DrawerContentScrollView>
  );
};
