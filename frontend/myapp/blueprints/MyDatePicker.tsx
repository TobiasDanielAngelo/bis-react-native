import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import moment from "moment";
import { View } from "react-native";
import { useCallback, useState } from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { winWidth } from "../constants/constants";
import { MyIcon } from "./MyIcon";

export const MyDatePicker = (props: {
  hidden?: boolean;
  date: Date;
  setDate: (t: Date) => void;
  range?: "past" | "future";
  size: "small" | "medium" | "large";
  noIcon?: boolean;
}) => {
  const { hidden, setDate, date, range, size, noIcon } = props;
  const [show, setShow] = useState(false);

  const onChangeDate = useCallback((event: DateTimePickerEvent, date: Date) => {
    if (event.type == "set") {
      setDate(date);
      setShow(false);
    } else {
      setShow(false);
    }
  }, []);

  return (
    !hidden && (
      <View style={styles.main}>
        {!noIcon && (
          <MyIcon
            name="date-range"
            size={size}
            onPress={() => setShow(true)}
            label={moment(date).format("MMM D, YYYY")}
            uncut
            color="teal"
          />
        )}
        {noIcon && (
          <View style={styles.bar}>
            <Text style={styles.text} onPress={() => setShow(true)}>
              {moment(date).format("MMM D, YYYY")}
            </Text>
            <MyIcon
              name="edit"
              size="small"
              noLabel
              onPress={() => setShow(true)}
            />
          </View>
        )}
        {show &&
          (range === "past" ? (
            <DateTimePicker
              mode="date"
              display="calendar"
              maximumDate={new Date()}
              value={date}
              onChange={(e, date) => onChangeDate(e, date ?? new Date())}
            />
          ) : range === "future" ? (
            <DateTimePicker
              mode="date"
              display="calendar"
              minimumDate={new Date()}
              value={date}
              onChange={(e, date) => onChangeDate(e, date ?? new Date())}
            />
          ) : (
            <DateTimePicker
              mode="date"
              display="calendar"
              value={date}
              onChange={(e, date) => onChangeDate(e, date ?? new Date())}
            />
          ))}
      </View>
    )
  );
};

const styles = StyleSheet.create({
  main: {
    margin: 5,
  },
  text: {
    fontSize: winWidth * 0.05,
    color: "teal",
  },
  bar: {
    flexDirection: "row",
  },
});
