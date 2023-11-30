import {
  Model,
  _async,
  _await,
  model,
  modelAction,
  modelFlow,
  prop,
} from "mobx-keystone";

import AsyncStorage from "@react-native-async-storage/async-storage";

export interface UserInterface {
  username?: string;
  user_id?: string;
  first_name?: string;
  last_name?: string;
  privilege?: string;
  isActive?: boolean;
}

@model("myApp/User")
export class User extends Model({
  username: prop<string>(""),
  user_id: prop<string>(""),
  first_name: prop<string>(""),
  last_name: prop<string>(""),
  privilege: prop<string>(""),
  is_active: prop<boolean>(true),
}) {}

export const defaultUser = new User({
  username: "",
  user_id: "",
  first_name: "",
  last_name: "",
  privilege: "",
  is_active: true,
});

@model("myApp/UserStore")
export class UserStore extends Model({
  users: prop<User[]>(() => []),
  currentUser: prop<User>(() => defaultUser),
}) {
  @modelFlow
  fetchUser = _async(function* (this: UserStore, userId: string) {
    let token: string;

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    let response: Response;

    response = yield* _await(
      fetch(`http://192.168.254.197:8000/users/?userid=${userId}`, {
        method: "GET",
        headers: {
          "Content-type": "application/json",
          Authorization: `Token ${token}`,
        },
      })
    );

    if (!response.ok) {
      let msg: any = yield* _await(response.json());
      if (msg.non_field_errors) {
        return {
          details: `${msg.non_field_errors}`,
          ok: false,
          data: null,
        };
      }
      return { details: `${msg.error}`, ok: false, data: null };
    }

    let json: User;
    try {
      const resp = yield* _await(response.json());
      json = resp[0];
    } catch (error) {
      console.error("Parsing Error", error);
      return { details: "Parsing Error", ok: false, data: null };
    }

    return { details: "", ok: true, data: json };
  });

  @modelFlow
  loginUser = _async(function* (
    this: UserStore,
    credentials: {
      username: string;
      password: string;
    }
  ) {
    let response: Response;

    response = yield* _await(
      fetch(`http://192.168.254.197:8000/login`, {
        method: "POST",
        body: JSON.stringify(credentials),
        headers: {
          "Content-type": "application/json",
        },
      })
    );

    if (!response.ok) {
      let msg: any = yield* _await(response.json());

      if (msg.non_field_errors) {
        return {
          details: `${msg.non_field_errors}`,
          ok: false,
          data: null,
        };
      }
      return { details: `${msg.error}`, ok: false, data: null };
    }

    let json: User;
    try {
      const resp = yield* _await(response.json());
      json = resp.user;
      AsyncStorage.setItem("@userToken", resp.key);
      AsyncStorage.setItem("@currentUser", JSON.stringify(json));
    } catch (error) {
      console.error("Parsing Error", error);
      return { details: "Parsing Error", ok: false, data: null };
    }

    this.currentUser = new User(json);

    return { details: "", ok: true, data: this.currentUser };
  });

  @modelFlow
  logoutUser = _async(function* (this: UserStore) {
    let token: string;

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    let response: Response;

    response = yield* _await(
      fetch(`http://192.168.254.197:8000/logout`, {
        method: "POST",
        headers: {
          "Content-type": "application/json",
          Authorization: `Token ${token}`,
        },
      })
    );

    if (!response.ok) {
      let msg = yield* _await(response.json()) as any;
      if (msg.non_field_errors) {
        return {
          details: `${msg.non_field_errors}`,
          ok: false,
          data: null,
        };
      }
      return { details: `${msg.error}`, ok: false, data: null };
    }

    AsyncStorage.removeItem("@userToken");
    AsyncStorage.removeItem("@currentUser");

    return { details: "", ok: true, data: null };
  });

  @modelFlow
  reauthUser = _async(function* (this: UserStore) {
    let token: string;

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    if (token === "") {
      return { details: `No token available.`, ok: false, data: null };
    }

    let response: Response;

    response = yield* _await(
      fetch(`http://192.168.254.197:8000/reauth`, {
        method: "POST",
        headers: {
          "Content-type": "application/json",
          Authorization: `Token ${token}`,
        },
      })
    );

    if (!response.ok) {
      AsyncStorage.clear();

      let msg = yield* _await(response.json()) as any;

      if (msg.non_field_errors) {
        return {
          details: `${msg.non_field_errors}`,
          ok: false,
          data: null,
        };
      }
      return { details: `${msg.error}`, ok: false, data: null };
    }

    let json: User;
    try {
      const resp = yield* _await(response.json());
      json = resp.user;
    } catch (error) {
      console.error("Parsing Error", error);
      return { details: "Parsing Error", ok: false, data: null };
    }

    this.currentUser = new User(json);

    return { details: "", ok: true, data: this.currentUser };
  });
}

export const userStore = new UserStore({});
