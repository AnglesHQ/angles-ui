import React from 'react';
import Chart from 'react-apexcharts';
import { Panel, Stack } from 'rsuite';
import { useIntl } from 'react-intl';

const defaultOptions = {
  chart: {
    toolbar: { show: false },
    animations: { enabled: false },
    background: 'var(--main-panel-background)',
    foreColor: 'var(--main-panel-font-color)',
    events:
      {
        click: (event, chartContext, config) => {
          console.log(event, chartContext, config);
        },
      },
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
  const intl = useIntl();
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
      labels: [
        intl.formatMessage({ id: 'page.dashboard.chart.barchart.pass' }),
        intl.formatMessage({ id: 'page.dashboard.chart.barchart.skipped' }),
        intl.formatMessage({ id: 'page.dashboard.chart.barchart.error' }),
        intl.formatMessage({ id: 'page.dashboard.chart.barchart.fail' }),
      ],
      colors: ['var(--pass-color)', 'var(--skipped-color)', 'var(--error-color)', 'var(--fail-color)'],
    };
    return graphData;
  }
  return null;
};

const ExecutionPieChart = function (props) {
  const {
    currentBuild,
    title,
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
