import React from 'react';
import Chart from 'react-apexcharts';
import { Panel, Stack } from 'rsuite';
import moment from 'moment';
import { getBuildDurationInSeconds } from '../../../../utility/TimeUtilities';

// Returns a fresh options object per render. This used to be a module-level
// constant that the component pushed a new entry onto (`defaultOptions.yaxis
// .push(...)`), so the yaxis array grew on every single render.
const buildOptions = (yaxisTitle, labels) => ({
  chart: {
    fontFamily: 'inherit',
    parentHeightOffset: 0,
    toolbar: { show: false },
    zoom: { enabled: false },
    animations: { enabled: false },
    background: 'var(--main-panel-background)',
    foreColor: 'var(--main-panel-font-color)',
  },
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
      title: { text: yaxisTitle },
    },
  ],
  colors: ['var(--color-primary)'],
  labels,
});

const generateResultsData = (executions) => {
  const graphData = {
    data: [],
    labels: [],
  };
  const executionTimes = [];
  const executionsToReverse = [...executions];
  executionsToReverse.reverse().forEach((execution) => {
    executionTimes.push(getBuildDurationInSeconds(execution));
    graphData.labels.push(moment.utc(moment(execution.start)).format('YYYY-MM-DD hh:mm:ss'));
  });
  graphData.data.push(
    { name: 'ExecutionTime', data: executionTimes, type: 'line' },
  );
  return graphData;
};

const TestExecutionTimelineChart = function (props) {
  const { executions, title, yaxisTitle } = props;
  const { data, labels } = generateResultsData(executions);
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
        options={buildOptions(yaxisTitle, labels)}
      />
    </Panel>
  );
};

export default TestExecutionTimelineChart;
