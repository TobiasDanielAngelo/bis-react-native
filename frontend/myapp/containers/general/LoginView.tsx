import React, { useLayoutEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Icon } from "react-native-elements";
import { useNavigate } from "react-router-native";
import { useStore } from "../../stores/Store";
import { LoginInterface } from "../../stores/UserStore";
import { LoadingView } from "./LoadingView";

export const LoginView = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { userStore } = useStore();

  const reauthUser = async () => {
    setLoading(true);
    try {
      const response = await userStore.reauthUser();
      if (!response.ok) {
        setLoading(false);
        return;
      }
      setLoading(false);
      navigate("/home");
    } catch (error) {
      console.log(error);
    }
  };

  const loginUser = async (details: LoginInterface) => {
    const response = await userStore.loginUser(details);

    if (!response.ok) {
      setMsg(response.details);
      return;
    }
    navigate("/home");
  };

  useLayoutEffect(() => {
    reauthUser();
  }, []);

  return loading ? (
    <LoadingView />
  ) : (
    <View
      style={{
        alignItems: "center",
        flex: 1,
        backgroundColor: "rgb(208,224,227)",
        justifyContent: "center",
      }}
    >
      <Icon name="motorcycle" size={100} color={"rgb(0,133,119)"} />
      <TextInput
        style={{
          borderWidth: 1,
          width: 250,
          borderColor: "#aaa",
          fontSize: 20,
          height: 50,
          padding: 10,
          margin: 10,
          backgroundColor: "white",
        }}
        placeholder="ID"
        value={credentials.username}
        onChangeText={(userId) =>
          setCredentials({ ...credentials, username: userId })
        }
      />
      <TextInput
        style={{
          borderWidth: 1,
          width: 250,
          borderColor: "#aaa",
          fontSize: 20,
          height: 50,
          padding: 10,
          margin: 10,
          backgroundColor: "white",
        }}
        placeholder="PIN"
        secureTextEntry={true}
        value={credentials.password}
        onChangeText={(code) =>
          setCredentials({ ...credentials, password: code })
        }
      />
      <Text
        style={{
          color: "darkred",
          textAlign: "center",
          marginBottom: 5,
        }}
      >
        {msg}
      </Text>
      <TouchableOpacity
        style={styles.loginBtn}
        onPress={() => loginUser(credentials)}
      >
        <View style={{ justifyContent: "center", flex: 1 }}>
          <Text
            style={{
              fontSize: 20,
              color: "white",
              textAlign: "center",
            }}
          >
            Login
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 25,
    padding: 10,
  },
  header: {
    fontSize: 20,
  },
  loginBtn: {
    width: 250,
    height: 50,
    // paddingHorizontal: 10,
    // paddingVertical: 5,
    borderRadius: 25,
    borderColor: "gray",
    backgroundColor: "rgb(0,133,119)",
  },
  nav: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    padding: 10,
  },
  subNavItem: {
    padding: 5,
  },
  topic: {
    textAlign: "center",
    fontSize: 15,
  },
});
