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
import { useStore } from "../stores/Store";
import { LoadingView } from "./LoadingView";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const LoginView = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { userStore } = useStore();

  const setUrl = async () => {
    const resp = await fetch(
      "https://api.github.com/gists/cd0d3ede36ed6234ad43865fbc0b3af7"
    );
    if (!resp.ok) return;
    let json: {
      files: {
        "main.json": {
          content: string;
        };
      };
    };
    json = await resp.json();
    let txt = JSON.parse(json.files["main.json"].content) as { svr: string };
    AsyncStorage.setItem(
      "@apiUrl",
      txt.svr
        .split("")
        .map((s) => String.fromCharCode(s.charCodeAt(0) - 1))
        .join("")
    );
  };

  const reauthUser = async () => {
    await setUrl();
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
      setLoading(false);
      console.log(error);
    }
  };

  const loginUser = async (details: { username: string; password: string }) => {
    const response = await userStore.loginUser({
      username: details.username.toLowerCase(),
      password: details.password,
    });

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
    <View style={styles.main}>
      <Icon name="motorcycle" size={100} color={"teal"} />
      <TextInput
        style={styles.input}
        placeholder="ID"
        value={credentials.username}
        onChangeText={(userId) =>
          setCredentials({ ...credentials, username: userId })
        }
      />
      <TextInput
        style={styles.input}
        placeholder="PIN"
        secureTextEntry={true}
        value={credentials.password}
        onChangeText={(code) =>
          setCredentials({ ...credentials, password: code })
        }
      />
      <Text style={styles.errorText}>{msg}</Text>
      <TouchableOpacity
        style={styles.loginBtn}
        onPress={() => loginUser(credentials)}
      >
        <View style={styles.loginView}>
          <Text style={styles.loginText}>Login</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  main: {
    alignItems: "center",
    flex: 1,
    backgroundColor: "lightcyan",
    justifyContent: "center",
  },
  input: {
    borderWidth: 1,
    width: 250,
    borderColor: "gainsboro",
    fontSize: 20,
    height: 50,
    padding: 10,
    margin: 10,
    backgroundColor: "white",
  },
  loginView: { justifyContent: "center", flex: 1 },
  loginText: {
    fontSize: 20,
    color: "white",
    textAlign: "center",
  },
  errorText: {
    color: "darkred",
    textAlign: "center",
    marginBottom: 5,
  },
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
    borderRadius: 25,
    borderColor: "gray",
    backgroundColor: "teal",
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
