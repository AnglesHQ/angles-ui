import React from 'react';
import Chart from 'react-apexcharts';
import { Panel, Stack } from 'rsuite';

const generatePlatformDistributionBarGraphData = (metrics) => {
  const result = {};
  const allExecutions = metrics.periods
    .flatMap((period) => period.phases.flatMap((phase) => phase.executions));
  allExecutions.forEach((execution) => {
    if (execution.platforms && execution.platforms.length > 0) {
      execution.platforms.forEach((platform) => {
        if (!result[platform.platformName]) {
          result[platform.platformName] = 0;
        }
        result[platform.platformName] += 1;
      });
    }
  });
  const graphData = {
    data: [],
    labels: [],
  };
  Object.keys(result).forEach((key) => {
    graphData.labels.push(key);
    graphData.data.push({ name: key, data: [result[key]], type: 'column' });
  });
  return graphData;
};

const PlatformDistributionBarChart = function (props) {
  const title = 'Executions distribution by platform';
  const { metrics, platformColors: { colors } } = props;
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
        // columnWidth: '60%',
        horizontal: true,
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
      title: {
        text: 'Number of Executions',
      },
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
          text: 'Platforms',
        },
      },
    ],
    colors,
    legend: { show: true },
  };
  const graphData = generatePlatformDistributionBarGraphData(metrics);
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
        type="bar"
        height={350}
        max-width={500}
        /* eslint-disable-next-line prefer-object-spread */
        options={Object.assign({}, defaultOptions, undefined, { labels })}
      />
    </Panel>
  );
};

export default PlatformDistributionBarChart;
