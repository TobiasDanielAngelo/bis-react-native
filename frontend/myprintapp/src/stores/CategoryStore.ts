import {
  model,
  Model,
  modelFlow,
  prop,
  _async,
  _await,
  modelAction,
} from "mobx-keystone";

export interface CategoryInterface {
  pk: string;
  nature: string;
  title: string;
}

@model("myApp/Category")
export class Category extends Model({
  pk: prop<string>(""),
  nature: prop<string>(""),
  title: prop<string>(""),
}) {
  get asJson() {
    return {
      pk: this.pk,
      nature: this.nature,
      title: this.title,
    };
  }
}

@model("myApp/CategoryStore")
export class CategoryStore extends Model({
  categories: prop<Category[]>(() => []),
}) {
  get showCategories() {
    return this.categories.map((s) => s.asJson);
  }

  get allIDs() {
    return this.categories.map((s) => s.pk);
  }

  @modelAction
  categoryName(pk: string) {
    return this.categories.find((s) => s.pk === pk)?.title;
  }

  @modelAction
  categoryId(title: string) {
    return this.categories.find((s) => s.title === title)?.pk;
  }

  @modelFlow
  fetchCategories = _async(function* (this: CategoryStore) {
    let token: string;

    token = localStorage.getItem("@userToken") ?? "";

    let response: Response;

    response = yield* _await(
      fetch(`http://192.168.254.197:8000/categories/`, {
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

    let json: CategoryInterface[];
    try {
      const resp = yield* _await(response.json());
      json = resp;
    } catch (error) {
      console.error("Parsing Error", error);
      return { details: "Parsing Error", ok: false, data: null };
    }

    json.forEach((s) => {
      if (!this.allIDs.includes(s.pk)) {
        this.categories.push(new Category(s));
      }
    });

    return { details: "", ok: true, data: json };
  });
}

export const categoryStore = new CategoryStore({});
