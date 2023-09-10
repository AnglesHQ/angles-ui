import React from 'react';
import Chart from 'react-apexcharts';
import { Panel, Stack } from 'rsuite';

const defaultOptions = {
  chart: {
    toolbar: { show: false },
    animations: { enabled: false },
  },
  xaxis: {
    tooltip: {
      enabled: true,
    },
    axisBorder: {
      show: true,
    },
  },
  colors: ['var(--pass-color)', 'var(--skipped-color)', 'var(--error-color)', 'var(--fail-color)'],
  legend: { show: false },
};

const generatePieChartData = (testRunMetrics) => {
  const {
    pass,
    fail,
    skipped,
    error,
  } = testRunMetrics;
  const graphData = {
    data: [pass, skipped, error, fail],
    labels: ['Pass', 'Skipped', 'Error', 'Fail'],
  };
  return graphData;
};

const ExecutionPieChart = function (props) {
  const title = 'Overall Execution Metrics';
  const {
    testRunMetrics,
  } = props;
  const { data, labels } = generatePieChartData(testRunMetrics);
  return (
    <Panel
      className="card"
      header={(
        <Stack justifyContent="space-between">
          {title}
        </Stack>
      )}
    >
      <Chart
        series={data}
        type="pie"
        height={350}
        max-width={500}
        /* eslint-disable-next-line prefer-object-spread */
        options={Object.assign({}, defaultOptions, { labels })}
      />
    </Panel>
  );
};

export default ExecutionPieChart;
