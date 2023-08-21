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
  colors: ['#98dc79', '#c1a224', '#ff8000', '#c61410'],
  legend: { show: false },
};

const ExecutionPieChart = function (props) {
  const {
    title,
    graphData: { data, labels },
  } = props;
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