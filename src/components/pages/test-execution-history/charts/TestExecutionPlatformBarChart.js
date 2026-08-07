import React from 'react';
import Chart from 'react-apexcharts';
import { Panel, Stack } from 'rsuite';
import { getPaletteColor, getPlatformLabel } from '../../../../utility/ChartConfig';

const generatePlatformDistributionBarGraphData = (executions) => {
  const result = {};
  executions.forEach((execution) => {
    if (execution.platforms && execution.platforms.length > 0) {
      execution.platforms.forEach((platform) => {
        const platformLabel = getPlatformLabel(platform);
        if (!result[platformLabel]) {
          result[platformLabel] = 0;
        }
        result[platformLabel] += 1;
      });
    }
  });
  const platforms = Object.keys(result);
  const counts = platforms.map((platform) => result[platform]);
  return { platforms, counts };
};

const TestExecutionPlatformBarChart = function (props) {
  const {
    executions,
    title,
    yaxisTitle,
    xaxisTitle,
  } = props;

  const { platforms, counts } = generatePlatformDistributionBarGraphData(executions);
  const colors = platforms.map((platform, index) => getPaletteColor(index));

  const defaultOptions = {
    chart: {
      toolbar: { show: false },
      zoom: { enabled: false },
      animations: { enabled: false },
      stacked: false,
      background: 'var(--main-panel-background)',
      foreColor: 'var(--main-panel-font-color)',
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
    colors,
    legend: { show: false },
  };

  const series = [{ name: xaxisTitle, data: counts }];

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
        series={series}
        type="bar"
        height={Math.max(200, platforms.length * 50 + 80)}
        options={Object.assign({}, defaultOptions, { labels: platforms })}
      />
    </Panel>
  );
};

export default TestExecutionPlatformBarChart;
