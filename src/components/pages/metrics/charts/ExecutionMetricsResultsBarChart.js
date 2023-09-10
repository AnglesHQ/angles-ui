import React from 'react';
import Chart from 'react-apexcharts';
import { Panel, Stack } from 'rsuite';
import moment from 'moment/moment';

const defaultOptions = {
  chart: {
    toolbar: { show: false },
    animations: { enabled: false },
    stacked: true,
    stackType: 'normal',
    background: 'var(--panel-background)',
    foreColor: 'var(--font-color-2)',
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
  yaxis: [
    {
      title: {
        text: 'Number of Executions',
      },
    },
  ],
  colors: ['var(--pass-color)', 'var(--skipped-color)', 'var(--error-color)', 'var(--fail-color)'],
  legend: { show: true },
};

const generateMetricsResultsData = (metrics) => {
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
    { name: 'Pass', data: results.PASS, type: 'column' },
    { name: 'Skipped', data: results.SKIPPED, type: 'column' },
    { name: 'Error', data: results.ERROR, type: 'column' },
    { name: 'Fail', data: results.FAIL, type: 'column' },
  );
  return graphData;
};

const ExecutionMetricsResultsBarChart = function (props) {
  const title = 'Executions grouped by result';
  const { metrics } = props;
  const { data, labels } = generateMetricsResultsData(metrics);
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
