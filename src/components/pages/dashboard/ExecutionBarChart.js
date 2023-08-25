import React from 'react';
import Chart from 'react-apexcharts';
import { Panel, Stack } from 'rsuite';

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
  legend: { show: false },
};

const ExecutionBarChart = function (props) {
  const {
    title,
    actions,
    graphData: { data, labels },
  } = props;
  return (
    <Panel
      className="card"
      header={(
        <Stack justifyContent="space-between">
          {title}
          {actions}
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
