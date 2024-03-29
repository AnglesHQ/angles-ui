import React from 'react';
import Chart from 'react-apexcharts';
import { Panel, Stack } from 'rsuite';

const defaultOptions = {
  chart: {
    toolbar: { show: false },
    animations: { enabled: false },
    background: 'var(--main-panel-background)',
    foreColor: 'var(--main-panel-font-color)',
  },
  xaxis: {
    tooltip: {
      enabled: true,
    },
    axisBorder: {
      show: true,
    },
  },
  colors: ['var(--pass-color)', 'var(--fail-color)', 'var(--error-color)', 'var(--skipped-color)'],
  legend: {
    show: true,
    fontSize: '14px',
    formatter: (seriesName, opts) => `${seriesName}: <strong> ${opts.w.config.series[opts.seriesIndex]}</strong>`,

  },
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
  const data = [PASS, FAIL, ERROR, SKIPPED];
  const graphData = {
    data,
    labels: ['PASS', 'FAIL', 'ERROR', 'SKIPPED'],
    colors: ['var(--pass-color)', 'var(--fail-color)', 'var(--error-color)', 'var(--skipped-color)'],
  };
  return graphData;
};

const TestExecutionsResultPieChart = function (props) {
  const {
    executions,
    title,
  } = props;
  const { data, labels } = generateExecutionMetricsPieChartData(executions);
  return (
    <Panel
      className="chart-panel"
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
