import {
  model,
  Model,
  modelAction,
  modelFlow,
  prop,
  _async,
  _await,
} from "mobx-keystone";

import AsyncStorage from "@react-native-async-storage/async-storage";

export interface UserInterface {
  username: string;
  userId: string;
  firstName: string;
  lastName: string;
  privilege: string;
  isActive: boolean;
}

export interface LoginInterface {
  username: string;
  password: string;
}

@model("myApp/User")
export class User extends Model({
  username: prop<string>(""),
  userId: prop<string>(""),
  firstName: prop<string>(""),
  lastName: prop<string>(""),
  privilege: prop<string>(""),
  isActive: prop<boolean>(true),
}) {
  get asJson() {
    return {
      username: this.username,
      userId: this.userId,
      firstName: this.firstName,
      lastName: this.lastName,
      privilege: this.privilege,
      isActive: this.isActive,
    };
  }
}

@model("myApp/UserStore")
export class UserStore extends Model({
  users: prop<User[]>(() => []),
}) {
  get showUsers() {
    return this.users.map((s) => s.asJson);
  }

  @modelAction
  addUser(credentials: UserInterface) {
    this.users.push(new User(credentials));
  }

  @modelFlow
  loginUser = _async(function* (this: UserStore, credentials: LoginInterface) {
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

    let json: UserInterface;
    try {
      const resp = yield* _await(response.json());
      json = resp.user;
      AsyncStorage.setItem("@userToken", resp.key);
      AsyncStorage.setItem("@currentUser", JSON.stringify(json));
    } catch (error) {
      console.error("Parsing Error", error);
      return { details: "Parsing Error", ok: false, data: null };
    }

    let user: User;

    user = new User(json);

    this.users.push(user);

    return { details: "", ok: true, data: user };
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

    let json: UserInterface;
    try {
      const resp = yield* _await(response.json());
      json = resp.user;
    } catch (error) {
      console.error("Parsing Error", error);
      return { details: "Parsing Error", ok: false, data: null };
    }

    let user: User;

    user = new User(json);

    if (!this.users.includes(user)) this.users.push(user);

    return { details: "", ok: true, data: user };
  });
}

export const userStore = new UserStore({});
