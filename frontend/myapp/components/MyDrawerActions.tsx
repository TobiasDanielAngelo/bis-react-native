import {
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from "@react-navigation/drawer";
import { useCallback } from "react";
import { Icon } from "react-native-elements";
import { useNavigate } from "react-router-native";
import { useStore } from "../stores/Store";
import { doNothing } from "../constants/constants";

const arrayRange = (start: number, stop: number) =>
  Array.from({ length: stop - start }, (value, index) => start + index);

export const DrawerActions = (props: any) => {
  const navigate = useNavigate();
  const {
    mechanicStore,
    productStore,
    accountStore,
    sparePartStore,
    categoryStore,
    motorStore,
    userStore,
  } = useStore();

  const logoutUser = async () => {
    const response = await userStore.logoutUser();
    if (!response.ok) {
      return;
    }
    navigate("/login");
  };

  const getProducts = useCallback(async () => {
    const resp = await productStore.fetchProductRange();
    if (!resp.ok || !resp.data) return;
    for (let i = resp.data.min_id; i <= resp.data.max_id; i += 40) {
      await productStore.fetchProducts({ ids: arrayRange(i, i + 40) });
    }
  }, []);

  const getParts = useCallback(() => {
    sparePartStore.fetchAll();
  }, []);

  const getAccounts = useCallback(() => {
    accountStore.fetchAll();
  }, []);

  const getMechanics = useCallback(() => {
    mechanicStore.fetchAll({ isActive: true });
  }, []);

  const getCategories = useCallback(() => {
    categoryStore.fetchAll();
  }, []);

  const getMotors = useCallback(() => {
    motorStore.fetchAll();
  }, []);

  const onPressRefresh = () => {
    getAccounts();
    getMechanics();
    getParts();
    getCategories();
    getMotors();
    getProducts();
  };

  return (
    <DrawerContentScrollView>
      <DrawerItem
        label={userStore.currentUser.username.toUpperCase()}
        onPress={doNothing}
      />
      <DrawerItemList {...props} />
      <DrawerItem label="Refresh Assets" onPress={onPressRefresh} />
      <DrawerItem label="Logout" onPress={logoutUser} />
    </DrawerContentScrollView>
  );
};
