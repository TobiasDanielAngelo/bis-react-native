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
  update(details: CategoryInterface) {
    Object.assign(this, details);
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
  fetchAll = _async(function* (
    this: CategoryStore,
    filters?: {
      startDate?: string;
      endDate?: string;
      ids?: number[];
      isActive?: boolean;
    }
  ) {
    let queryFilters: string[] = [];
    let query: string = "";

    if (filters) {
      if (filters.startDate)
        queryFilters.push(`start_date=${filters.startDate}`);
      if (filters?.endDate) queryFilters.push(`end_date=${filters.endDate}`);
      if (filters?.ids) queryFilters.push(`ids=${filters.ids.join("+")}`);
      if (filters?.isActive)
        queryFilters.push(`is_active=${filters?.isActive ? "true" : "false"}`);
    }

    if (queryFilters.length > 0) {
      query = "?" + queryFilters.join("&");
    }

    let token: string;

    token = (yield* _await(AsyncStorage.getItem("@userToken"))) ?? "";

    let response: Response;

    response = yield* _await(
      fetch(`${process.env["EXPO_PUBLIC_BASE_URL"]}/categories/${query}`, {
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
