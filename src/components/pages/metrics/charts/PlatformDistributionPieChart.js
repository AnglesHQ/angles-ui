import React from 'react';
import Chart from 'react-apexcharts';
import { Panel, Stack } from 'rsuite';

const generatePlatformDistributionGraphData = (metrics) => {
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
    data: Object.values(result),
    labels: Object.keys(result),
  };
  return graphData;
};

const PlatformDistributionPieChart = function (props) {
  const {
    metrics,
    title,
    platformColors,
  } = props;
  const graphData = generatePlatformDistributionGraphData(metrics);
  const { data, labels } = graphData;
  const { colors } = platformColors;
  const defaultOptions = {
    chart: {
      toolbar: { show: false },
      animations: { enabled: false },
      background: 'var(--sub-panel-background)',
      foreColor: 'var(--sub-panel-font-color)',
    },
    xaxis: {
      tooltip: {
        enabled: true,
      },
      axisBorder: {
        show: true,
      },
    },
    colors,
    legend: { show: true },
  };
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
        type="pie"
        height={350}
        max-width={500}
        /* eslint-disable-next-line prefer-object-spread */
        options={Object.assign({}, defaultOptions, { labels })}
      />
    </Panel>
  );
};

export default PlatformDistributionPieChart;
