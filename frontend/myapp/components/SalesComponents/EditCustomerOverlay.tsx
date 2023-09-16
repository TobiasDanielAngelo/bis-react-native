import { useEffect, useState, useCallback } from "react";
import { Text, View, StyleSheet, TextInput } from "react-native";
import { Icon, Overlay } from "react-native-elements";

export const EditCustomerOverlay = (props: {
  handleUpdateSubmit: (name: string) => void;
  visible: boolean;
  setVisible: (v: boolean) => void;
}) => {
  const [name, setName] = useState("");

  const handleChange = useCallback((text: any) => {
    setName(text);
  }, []);

  useEffect(() => {
    setName("");
  }, [props.visible]);

  return (
    <>
      <Overlay
        isVisible={props.visible}
        onBackdropPress={() => props.setVisible(false)}
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
              onPress={() => props.setVisible(false)}
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
                // setName("");
                props.setVisible(false);
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
