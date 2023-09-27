import DropDownPicker from "react-native-dropdown-picker";
import { winWidth } from "../constants/constants";
import { CategoryInterface } from "../constants/interfaces";
import { Icon } from "react-native-elements";
import { useState } from "react";

export const ExpenseCategorySelector = (props: {
  categories: CategoryInterface[];
  setValue: (t: any) => void;
  categoryId: string;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <DropDownPicker
      items={[
        ...props.categories.map((s) => ({
          label: s.title,
          value: s.pk,
          icon: () => <Icon name={s.logo} size={50} />,
        })),
        {
          label: "Select Category...",
          value: "-1",
          icon: () => <Icon name="star" size={50} />,
        },
      ]}
      multiple={false}
      setValue={props.setValue}
      value={props.categoryId}
      open={open}
      setOpen={setOpen}
      textStyle={{
        fontSize: 30,
      }}
      maxHeight={500}
      style={{
        height: 100,
        width: winWidth * 0.9,
        margin: winWidth * 0.05,
      }}
      listItemContainerStyle={{
        height: 100,
        padding: 10,
      }}
      dropDownContainerStyle={{
        width: winWidth * 0.9,
        margin: winWidth * 0.05,
      }}
      searchable={true}
      searchPlaceholder="Search..."
    />
  );
};
