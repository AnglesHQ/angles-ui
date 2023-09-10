import React from 'react';
import Chart from 'react-apexcharts';
import { Panel, Stack } from 'rsuite';

const defaultOptions = {
  chart: {
    toolbar: { show: false },
    animations: { enabled: false },
    background: 'var(--panel-background)',
    foreColor: 'var(--font-color-2)',
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
  legend: { show: true },
};

const generateExecutionMetricsPieChartData = (currentBuild) => {
  if (currentBuild) {
    const {
      PASS,
      FAIL,
      SKIPPED,
      ERROR,
    } = currentBuild.result;
    const data = [PASS, SKIPPED, ERROR, FAIL];
    const graphData = {
      data,
      labels: ['PASS', 'SKIPPED', 'ERROR', 'FAIL'],
      colors: ['var(--pass-color)', 'var(--skipped-color)', 'var(--error-color)', 'var(--fail-color)'],
    };
    return graphData;
  }
  return null;
};

const ExecutionPieChart = function (props) {
  const title = 'Overall Execution Metrics';
  const {
    currentBuild,
  } = props;
  const { data, labels } = generateExecutionMetricsPieChartData(currentBuild);
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

export default ExecutionPieChart;
