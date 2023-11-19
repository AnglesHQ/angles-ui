import React from 'react';
import Chart from 'react-apexcharts';
import { Panel, Stack } from 'rsuite';
import moment from 'moment';
import { getBuildDurationInSeconds } from '../../../../utility/TimeUtilities';

const defaultOptions = {
  chart: {
    fontFamily: 'inherit',
    parentHeightOffset: 0,
    toolbar: { show: false },
    animations: { enabled: false },
    background: 'var(--main-panel-background)',
    foreColor: 'var(--main-panel-font-color)',
  },
  plotOptions: {},
  dataLabels: {
    enabled: false,
  },
  stroke: {
    width: [3],
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
      seriesName: 'ExecutionTime',
      // opposite: true,
      title: {
        text: 'Execution Time (seconds)',
      },
    },
  ],
  colors: ['#2485C1'],
  // legend: { show: true },
};

const generateResultsData = (executions) => {
  const graphData = {
    data: [],
    labels: [],
  };
  const executionTimes = [];
  const executionsToReverse = [...executions];
  executionsToReverse.reverse().forEach((execution) => {
    executionTimes.push(getBuildDurationInSeconds(execution));
    graphData.labels.push(moment(execution.start).format('YYYY-MM-DD hh:mm:ss'));
  });
  graphData.data.push(
    { name: 'ExecutionTime', data: executionTimes, type: 'line' },
  );
  return graphData;
};

const TestExecutionTimelineChart = function (props) {
  const title = 'Execution Times';
  const { executions } = props;
  const graphData = generateResultsData(executions);
  const { data, labels } = graphData;
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

export default TestExecutionTimelineChart;
