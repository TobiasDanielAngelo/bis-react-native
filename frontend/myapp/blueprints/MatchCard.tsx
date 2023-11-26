import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { winWidth } from "../constants/constants";
import { toMoney } from "../constants/helpers";

export const MatchCard = <T extends { id: number }>(props: {
  item: T;
  mainText: string;
  subText?: string;
  commentText?: string;
  price?: number;
  onPress?: () => void;
}) => {
  const { item, onPress, mainText, subText, commentText, price } = props;

  return (
    <TouchableOpacity key={item.id} onPress={onPress} style={styles.main}>
      <Text style={styles.mainText}>{mainText}</Text>
      <Text style={styles.subText}>{subText && subText.substring(0, 39)}</Text>
      <Text style={styles.commentText}>
        {commentText && commentText.substring(0, 39)}
      </Text>
      <Text style={styles.priceText}>{price && `\u20b1${toMoney(price)}`}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  main: {
    borderBottomWidth: 1,
    margin: 5,
    padding: 5,
  },
  mainText: {
    fontSize: winWidth * 0.05,
    fontFamily: "monospace",
  },
  subText: {
    fontSize: winWidth * 0.035,
    fontFamily: "monospace",
  },
  commentText: {
    fontSize: winWidth * 0.035,
    color: "gray",
    fontStyle: "italic",
    fontFamily: "monospace",
  },
  priceText: {
    fontSize: winWidth * 0.05,
    textAlign: "right",
  },
});
