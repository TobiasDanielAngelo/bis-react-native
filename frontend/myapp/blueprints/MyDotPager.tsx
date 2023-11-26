import Dots from "react-native-dots-pagination";
import { doNothing } from "../constants/constants";
import { HView } from "./HView";
import { MyIcon } from "./MyIcon";

export const MyDotPager = (props: {
  hidden?: boolean;
  length: number;
  index: number;
  setIndex: (t: number | ((u: number) => number)) => void;
}) => {
  const { hidden, length, index, setIndex } = props;

  return (
    !hidden && (
      <HView>
        <MyIcon
          name="navigate-before"
          size="small"
          noLabel
          onPress={index > 0 ? () => setIndex((prev) => prev - 1) : doNothing}
        />
        <Dots
          length={length}
          active={index}
          passiveColor="lightgray"
          activeColor="teal"
        />
        <MyIcon
          name="navigate-next"
          size="small"
          noLabel
          onPress={
            index < length - 1 ? () => setIndex((prev) => prev + 1) : doNothing
          }
        />
      </HView>
    )
  );
};
