import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Model,
  _async,
  _await,
  model,
  modelAction,
  modelFlow,
  prop,
} from "mobx-keystone";

interface CategoryInterface {
  id?: number;
  nature?: string;
  title?: string;
  logo?: string;
}

@model("myApp/Category")
export class Category extends Model({
  id: prop<number>(-1),
  nature: prop<string>(""),
  title: prop<string>(""),
  logo: prop<string>(""),
}) {
  get asJson() {
    return {
      id: this.id,
      nature: this.nature,
      title: this.title,
      logo: this.logo,
    };
  }

  update(details: CategoryInterface) {
    this.id = details.id ?? this.id;
    this.nature = details.nature ?? this.nature;
    this.title = details.title ?? this.title;
    this.logo = details.logo ?? this.logo;
    return this;
  }
}

@model("myApp/CategoryStore")
export class CategoryStore extends Model({
  categories: prop<Category[]>(() => []),
}) {
  get allIDs() {
    return this.categories.map((s) => s.id);
  }

  @modelAction
  getItem(id: number) {
    return this.categories.find((s) => s.id === id);
  }

  @modelFlow
  fetchCategories = _async(function* (this: CategoryStore) {
    let token: string;

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    let response: Response;

    response = yield* _await(
      fetch(`${process.env["BASE_URL"]}/categories/`, {
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

    let json: Category[];
    try {
      const resp = yield* _await(response.json());
      json = resp;
    } catch (error) {
      console.error("Parsing Error", error);
      return { details: "Parsing Error", ok: false, data: null };
    }

    json.forEach((s) => {
      if (!this.allIDs.includes(s.id)) {
        this.categories.push(new Category(s));
      } else {
        this.categories
          .find((t) => t.id === s.id ?? -1)
          ?.update({
            id: s.id,
            nature: s.nature,
            title: s.title,
            logo: s.logo,
          });
      }
    });

    return { details: "", ok: true, data: json };
  });
}

export const categoryStore = new CategoryStore({});
