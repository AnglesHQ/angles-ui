import React from 'react';
import Chart from 'react-apexcharts';
import { Panel, Stack } from 'rsuite';
import moment from 'moment/moment';
import { useIntl } from 'react-intl';

const defaultOptions = {
  chart: {
    toolbar: { show: false },
    animations: { enabled: false },
    stacked: true,
    stackType: 'normal',
    background: 'var(--sub-panel-background)',
    foreColor: 'var(--sub-panel-font-color)',
  },
  plotOptions: {
    bar: {
      columnWidth: '60%',
      // horizontal: false,
    },
  },
  dataLabels: {
    enabled: false,
  },
  stroke: {
    width: [0, 0, 0, 0, 3],
    curve: 'smooth',
  },
  xaxis: {
    tooltip: {
      enabled: true,
    },
    axisBorder: {
      show: true,
    },
  },
  yaxis: [],
  colors: ['var(--pass-color)', 'var(--skipped-color)', 'var(--error-color)', 'var(--fail-color)'],
  legend: { show: true },
};

const generateMetricsResultsData = (metrics) => {
  const intl = useIntl();
  const graphData = {
    data: [],
    labels: [],
  };
  const results = {
    PASS: [],
    SKIPPED: [],
    ERROR: [],
    FAIL: [],
  };
  metrics.periods.forEach((metricPeriod) => {
    const {
      PASS,
      SKIPPED,
      ERROR,
      FAIL,
    } = metricPeriod.result;
    results.PASS.push(PASS || 0);
    results.SKIPPED.push(SKIPPED || 0);
    results.ERROR.push(ERROR || 0);
    results.FAIL.push(FAIL || 0);
    graphData.labels.push(`${moment.utc(moment(metricPeriod.start)).format('DD-MM-YYYY')} - ${moment.utc(moment(metricPeriod.end)).format('DD-MM-YYYY')}`);
  });
  graphData.data.push(
    {
      name: intl.formatMessage({ id: 'page.dashboard.chart.barchart.pass' }),
      data: results.PASS,
      type: 'column',
    },
    {
      name: intl.formatMessage({ id: 'page.dashboard.chart.barchart.skipped' }),
      data: results.SKIPPED,
      type: 'column',
    },
    {
      name: intl.formatMessage({ id: 'page.dashboard.chart.barchart.error' }),
      data: results.ERROR,
      type: 'column',
    },
    {
      name: intl.formatMessage({ id: 'page.dashboard.chart.barchart.pass' }),
      data: results.FAIL,
      type: 'column',
    },
  );
  return graphData;
};

const ExecutionMetricsResultsBarChart = function (props) {
  const { metrics, title, yaxisTitle } = props;
  defaultOptions.yaxis = [{ title: { text: yaxisTitle } }];
  const { data, labels } = generateMetricsResultsData(metrics);
  return (
    <Panel
      className="execution-metrics-chart-panel"
      header={(
        <Stack justifyContent="space-between">
          {title}
        </Stack>
      )}
    >
      <Chart
        series={data}
        type="line"
        height={350}
        max-width={500}
        /* eslint-disable-next-line prefer-object-spread */
        options={Object.assign({}, defaultOptions, undefined, { labels })}
      />
    </Panel>
  );
};

export default ExecutionMetricsResultsBarChart;
