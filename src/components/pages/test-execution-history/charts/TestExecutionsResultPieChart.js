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

const generateExecutionMetricsPieChartData = (executions) => {
  const result = {
    PASS: 0,
    FAIL: 0,
    SKIPPED: 0,
    ERROR: 0,
  };
  executions.forEach((execution) => {
    result[execution.status] += 1;
  });
  const {
    PASS,
    FAIL,
    SKIPPED,
    ERROR,
  } = result;
  const data = [PASS, SKIPPED, ERROR, FAIL];
  const graphData = {
    data,
    labels: ['PASS', 'SKIPPED', 'ERROR', 'FAIL'],
    colors: ['var(--pass-color)', 'var(--skipped-color)', 'var(--error-color)', 'var(--fail-color)'],
  };
  return graphData;
};

const TestExecutionsResultPieChart = function (props) {
  const title = 'Overall Execution Metrics';
  const {
    executions,
  } = props;
  const { data, labels } = generateExecutionMetricsPieChartData(executions);
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

export default TestExecutionsResultPieChart;
