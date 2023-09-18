import { useEffect, useState, useCallback, useContext } from "react";
import { Text, View, StyleSheet, TextInput } from "react-native";
import { Icon, Overlay } from "react-native-elements";
import { POSContext } from "../../interfaces/interfaces";

export const EditCustomerOverlay = (props: {
  handleUpdateSubmit: (name: string) => void;
}) => {
  const [name, setName] = useState("");
  const { popup, setPopup } = useContext(POSContext);
  const handleChange = useCallback((text: any) => {
    setName(text);
  }, []);

  useEffect(() => {
    setName("");
  }, [popup]);

  return (
    <>
      <Overlay
        isVisible={popup === "editName"}
        onBackdropPress={() => setPopup("")}
      >
        <View style={styles.msgBox}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Text style={{ fontSize: 16 }}>Edit Customer</Text>
            <Icon
              name={"close"}
              size={30}
              color={"#aaa"}
              onPress={() => setPopup("")}
            />
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingRight: 20,
            }}
          >
            <Text style={{ fontSize: 20, color: "#888" }}>Name</Text>
            <TextInput
              style={{
                marginTop: -5,
                padding: 5,
                borderWidth: 1,
                width: 200,
                borderColor: "#aaa",
                fontSize: 15,
                height: 40,
              }}
              value={name}
              onChangeText={handleChange}
            />
          </View>

          <View style={{ flexDirection: "row-reverse" }}>
            <Icon
              name={"check"}
              size={40}
              color={"#aaa"}
              onPress={() => {
                props.handleUpdateSubmit(name);
                setPopup("");
              }}
            />
          </View>
        </View>
      </Overlay>
    </>
  );
};

const styles = StyleSheet.create({
  msgBox: {
    height: 200,
    width: 300,
    justifyContent: "space-between",
  },
});
