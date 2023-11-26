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

const generatePieChartData = (testRunMetrics) => {
  const intl = useIntl();
  const {
    pass,
    fail,
    skipped,
    error,
  } = testRunMetrics;
  const graphData = {
    data: [pass || 0, skipped || 0, error || 0, fail || 0],
    labels: [
      intl.formatMessage({ id: 'page.dashboard.chart.barchart.pass' }),
      intl.formatMessage({ id: 'page.dashboard.chart.barchart.skipped' }),
      intl.formatMessage({ id: 'page.dashboard.chart.barchart.error' }),
      intl.formatMessage({ id: 'page.dashboard.chart.barchart.fail' }),
    ],
  };
  return graphData;
};

const ExecutionPieChart = function (props) {
  const {
    title,
    testRunMetrics,
  } = props;
  const { data, labels } = generatePieChartData(testRunMetrics);
  return (
    <Panel
      style={{ height: '500px' }}
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
        height={400}
        /* eslint-disable-next-line prefer-object-spread */
        options={Object.assign({}, defaultOptions, { labels })}
      />
    </Panel>
  );
};

export default ExecutionPieChart;
