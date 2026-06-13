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
  const platforms = Object.keys(result);
  const counts = platforms.map((platform) => result[platform]);
  return { platforms, counts };
};

const PlatformDistributionBarChart = function (props) {
  const {
    metrics,
    title,
    yaxisTitle,
    xaxisTitle,
    platformColors: { colors },
  } = props;

  const { platforms, counts } = generatePlatformDistributionBarGraphData(metrics);

  const defaultOptions = {
    chart: {
      toolbar: { show: false },
      animations: { enabled: false },
      stacked: false,
      background: 'var(--sub-panel-background)',
      foreColor: 'var(--sub-panel-font-color)',
    },
    plotOptions: {
      bar: {
        horizontal: true,
        distributed: true,
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      title: {
        text: xaxisTitle,
      },
      tooltip: {
        enabled: true,
      },
      axisBorder: {
        show: true,
      },
    },
    yaxis: {
      title: {
        text: yaxisTitle,
      },
      categories: platforms,
    },
    colors: colors && colors.length > 0 ? colors : undefined,
    legend: { show: false },
  };

  const series = [{ name: xaxisTitle, data: counts }];

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
        series={series}
        type="bar"
        height={Math.max(200, platforms.length * 50 + 80)}
        options={Object.assign({}, defaultOptions, { labels: platforms })}
      />
    </Panel>
  );
};

export default PlatformDistributionBarChart;
