import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { LineChartData } from "react-native-chart-kit/dist/line-chart/LineChart";
import { winWidth } from "../constants/constants";

const defaultDatePrice = {
  label: "",
  price: -1,
};

export const MyLineChart = (props: {
  hidden?: boolean;
  data: LineChartData;
}) => {
  const { hidden, data } = props;
  const [dataPoint, setDataPoint] = useState(defaultDatePrice);

  return (
    !hidden && (
      <View style={styles.main}>
        <LineChart
          data={data}
          width={winWidth}
          height={400}
          yAxisLabel={`\u20b1`}
          chartConfig={{
            backgroundColor: "#dddddd",
            backgroundGradientFrom: "teal",
            backgroundGradientTo: "gray",
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            style: {
              borderRadius: 16,
            },
          }}
          style={{
            margin: 10,
            borderRadius: 16,
          }}
          xLabelsOffset={20}
          verticalLabelRotation={270}
          onDataPointClick={(d) => {
            console.log(d.value, data.labels[d.index]);
            setDataPoint({ label: data.labels[d.index], price: d.value });
          }}
          bezier
        />
      </View>
    )
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
  },
  body: {
    flex: 1,
  },
  bar: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
});
