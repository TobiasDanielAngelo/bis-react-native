import { useContext, useState, useEffect } from "react";
import { View } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { Icon } from "react-native-elements";
import {
  CountSession,
  M3S4Context,
  MainContext,
} from "../constants/interfaces";
import { useStore } from "../stores/Store";
import { err } from "react-native-svg/lib/typescript/xml";
import {
  defaultProductQuantified,
  defaultSession,
} from "../constants/constants";

export const CheckBar = () => {
  const {
    setProducts,
    setProductDetails,
    sessions,
    setSessions,
    setSession,
    session,
    location,
    setLocation,
  } = useContext(M3S4Context);
  const { currentUser } = useContext(MainContext);
  const { transactionStore, productStore, categoryStore } = useStore();
  const [open, setOpen] = useState(false);

  const onCreateSession = async () => {
    const resp = await transactionStore.addTransaction({
      category: categoryStore.categoryId("Inventory Check") ?? "-1",
      description: `IC #, ${location}, Pending`,
      transmitter: "DATS",
      receiver: "DATS",
      particular_transaction: [],
    });

    setSessions((prev: CountSession[]) => {
      let targetSession = prev.find((s) => s.location === location);
      if (targetSession) {
        targetSession.isOngoing = true;
        targetSession.id = resp.data?.pk ?? "-1";
        return [...prev];
      } else {
        return [
          ...prev,
          {
            id: resp.data?.pk ?? "-1",
            isOngoing: true,
            counter: currentUser.userId,
            location: location,
            lastProdId: -1,
          },
        ];
      }
    });

    setSession({
      id: resp.data?.pk ?? "-1",
      isOngoing: true,
      counter: currentUser.userId,
      location: location,
    });
  };

  const onFinishSession = async () => {
    await transactionStore.updateTransaction(session.id, {
      description: `IC #, ${location}, Finished`,
    });

    setSessions((prev: CountSession[]) => {
      prev.splice(
        prev.findIndex((s) => s.id === session.id),
        1
      );
      return [...prev];
    });

    setSession({ ...session, isOngoing: false });
  };

  const getProductsByLocation = async () => {
    try {
      const resp = await productStore.fetchProductByLocation(location);
      if (resp.data)
        setProducts(
          resp.data.map((s) => ({
            product: s,
            quantity: 0,
            sold: 0,
            returned: 0,
            purchased: 0,
            gained: 0,
            lost: 0,
          }))
        );
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getProductsByLocation();
    setSession(sessions.find((s) => s.location === location) ?? defaultSession);
  }, [location]);

  return (
    <View>
      <View
        style={{
          flexDirection: "row",
          marginHorizontal: 10,
          marginVertical: 20,
        }}
      >
        <View style={{ flex: 1, marginHorizontal: 10 }}>
          <DropDownPicker
            items={"abcdefghijklmnopqrstuvwxyz"
              .toUpperCase()
              .split("")
              .map((s) => ({
                label: `Shelf ${s}${
                  !sessions.find((t) => t.isOngoing && t.location === s)
                    ? ""
                    : " - (Opened)"
                }`,
                value: s,
                icon: () => <></>,
              }))}
            multiple={false}
            setValue={(t) => {
              setProductDetails(defaultProductQuantified);
              setLocation(t);
            }}
            value={location}
            open={open}
            setOpen={setOpen}
            textStyle={{
              fontSize: 15,
              fontFamily: "monospace",
            }}
            style={{
              height: 35,
              borderColor: "#ddd",
              borderRadius: 0,
              flex: 1,
              minHeight: 35,
            }}
            placeholder="See itemizations in progress..."
            placeholderStyle={{ color: "gray" }}
          />
        </View>
        <Icon
          name={
            !sessions.find((s) => s.isOngoing && s.location === location)
              ? "add-circle"
              : "check-circle"
          }
          size={30}
          color={"teal"}
          onPress={
            !sessions.find((s) => s.isOngoing && s.location === location)
              ? onCreateSession
              : onFinishSession
          }
        />
      </View>
    </View>
  );
};
