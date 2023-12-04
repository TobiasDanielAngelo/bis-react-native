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
  data?: LineChartData;
}) => {
  const { hidden, data } = props;
  const [dataPoint, setDataPoint] = useState(defaultDatePrice);

  return (
    !hidden && (
      <View style={styles.main}>
        {!data ? (
          <></>
        ) : (
          <LineChart
            data={data}
            width={winWidth}
            height={400}
            yAxisLabel={`\u20b1`}
            yAxisSuffix={`k`}
            chartConfig={{
              backgroundColor: "#dddddd",
              backgroundGradientFrom: "teal",
              backgroundGradientTo: "gray",
              decimalPlaces: 1,
              color: (opacity = 1) =>
                data.datasets[0].data[0] >
                data.datasets[0].data[data.datasets[0].data.length - 1]
                  ? "palevioletred"
                  : "lightgreen",
              labelColor: (opacity = 1) => "white",
              scrollableDotStrokeColor: "white",
              style: {
                borderRadius: 16,
              },
              strokeWidth: 0,
            }}
            style={{
              margin: 10,
              borderRadius: 16,
            }}
            withHorizontalLines={false}
            withVerticalLines={false}
            xLabelsOffset={20}
            verticalLabelRotation={270}
            onDataPointClick={(d) => {
              setDataPoint({ label: data.labels[d.index], price: d.value });
            }}
            bezier
          />
        )}
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
