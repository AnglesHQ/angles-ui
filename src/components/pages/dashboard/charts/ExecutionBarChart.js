import React from 'react';
import Chart from 'react-apexcharts';
import { Panel, Stack } from 'rsuite';
import moment from 'moment';
import { getBuildDurationInSeconds } from '../../../../utility/TimeUtilities';

const defaultOptions = {
  chart: {
    // fontFamily: 'inherit',
    // parentHeightOffset: 0,
    toolbar: { show: false },
    animations: { enabled: false },
    stacked: true,
    stackType: 'normal',
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
      seriesName: 'Pass',
      title: {
        text: 'Number of Tests',
      },
    },
    {
      seriesName: 'Fail',
      show: false,
    },
    {
      seriesName: 'Error',
      show: false,
    },
    {
      seriesName: 'Skipped',
      show: false,
    },
    {
      seriesName: 'ExecutionTime',
      opposite: true,
      title: {
        text: 'Execution Time (seconds)',
      },
    },
  ],
  colors: ['var(--pass-color)', 'var(--skipped-color)', 'var(--error-color)', 'var(--fail-color)', '#2485C1'],
  legend: { show: true },
};

const generateResultsData = (builds) => {
  const graphData = {
    data: [],
    labels: [],
  };
  const results = {
    PASS: [],
    SKIPPED: [],
    ERROR: [],
    FAIL: [],
    executionTimes: [],
  };
  builds.forEach((build) => {
    const {
      PASS,
      SKIPPED,
      ERROR,
      FAIL,
    } = build.result;
    results.PASS.push(PASS);
    results.SKIPPED.push(SKIPPED);
    results.ERROR.push(ERROR);
    results.FAIL.push(FAIL);
    results.executionTimes.push(getBuildDurationInSeconds(build));
    graphData.labels.push(moment(build.start).format('YYYY-MM-DD hh:mm:ss'));
  });
  graphData.data.push(
    { name: 'Pass', data: results.PASS, type: 'column' },
    { name: 'Skipped', data: results.SKIPPED, type: 'column' },
    { name: 'Error', data: results.ERROR, type: 'column' },
    { name: 'Fail', data: results.FAIL, type: 'column' },
    { name: 'ExecutionTime', data: results.executionTimes, type: 'line' },
  );
  return graphData;
};

const ExecutionBarChart = function (props) {
  const title = '';
  const { builds } = props;
  const graphData = generateResultsData(builds);
  const { data, labels } = graphData;
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
        type="line"
        height={350}
        max-width={500}
        /* eslint-disable-next-line prefer-object-spread */
        options={Object.assign({}, defaultOptions, undefined, { labels })}
      />
    </Panel>
  );
};

export default ExecutionBarChart;
