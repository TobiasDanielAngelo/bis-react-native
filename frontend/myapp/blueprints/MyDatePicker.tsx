import DateTimePicker from "@react-native-community/datetimepicker";
import moment from "moment";
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

  const onChangeDate = useCallback((date: Date) => {
    setDate(date);
    setShow(false);
  }, []);

  return (
    !hidden && (
      <TouchableOpacity style={styles.main} onPress={() => setShow(true)}>
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
          <TouchableOpacity onPress={() => setShow(true)} style={styles.bar}>
            <Text style={styles.text}>
              {moment(date).format("MMM D, YYYY")}
            </Text>
            <MyIcon
              name="edit"
              size="small"
              noLabel
              onPress={() => setShow(true)}
            />
          </TouchableOpacity>
        )}
        {show &&
          (range === "past" ? (
            <DateTimePicker
              mode="date"
              display="calendar"
              maximumDate={new Date()}
              value={date}
              onChange={(_, date) => onChangeDate(date ?? new Date())}
            />
          ) : range === "future" ? (
            <DateTimePicker
              mode="date"
              display="calendar"
              minimumDate={new Date()}
              value={date}
              onChange={(_, date) => onChangeDate(date ?? new Date())}
            />
          ) : (
            <DateTimePicker
              mode="date"
              display="calendar"
              value={date}
              onChange={(_, date) => onChangeDate(date ?? new Date())}
            />
          ))}
      </TouchableOpacity>
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
