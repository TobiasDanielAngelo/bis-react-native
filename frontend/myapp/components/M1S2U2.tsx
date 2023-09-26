import DateTimePicker from "@react-native-community/datetimepicker";
import moment from "moment";
import { useState } from "react";
import { View } from "react-native";
import { Icon, Text } from "react-native-elements";

export const DateSelector = (props: {
  date: Date;
  setDate: (t: Date) => void;
}) => {
  const [showDate, setShowDate] = useState(false);

  const handleChangeDate = (date: Date) => {
    props.setDate(date);
    setShowDate(false);
  };

  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "darkslategray",
        paddingVertical: 10,
        flexDirection: "row",
      }}
    >
      <Text
        style={{ fontSize: 30, color: "white" }}
        onPress={() => setShowDate(true)}
      >
        {moment(props.date).format("ddd. MMM DD, YYYY")}
      </Text>
      <Icon
        name="edit"
        size={35}
        color="white"
        style={{ margin: 10 }}
        onPress={() => setShowDate(true)}
      />
      {showDate && (
        <DateTimePicker
          mode="date"
          display="calendar"
          value={props.date}
          maximumDate={new Date()}
          onChange={(_, date) => handleChangeDate(date ?? new Date())}
        />
      )}
    </View>
  );
};
