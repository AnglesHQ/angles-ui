import React from 'react';
import Chart from 'react-apexcharts';
import { Panel, Stack } from 'rsuite';

const defaultOptions = {
  chart: {
    toolbar: { show: false },
    animations: { enabled: false },
    background: 'var(--panel-background)',
    foreColor: 'var(--font-color-2)',
  },
  xaxis: {
    tooltip: {
      enabled: true,
    },
    axisBorder: {
      show: true,
    },
  },
  legend: { show: true },
};

const generateFeatureDistributionPieChartData = (currentBuild) => {
  if (currentBuild) {
    const values = {};
    currentBuild.suites.forEach((suite) => {
      suite.executions.forEach((execution) => {
        if (execution.feature && execution.feature !== '') {
          if (!values[execution.feature]) {
            values[execution.feature] = 0;
          }
          values[execution.feature] += 1;
        } else {
          if (!values.undefined) {
            values.undefined = 0;
          }
          values.undefined += 1;
        }
      });
    });
    const data = Object.values(values);
    const labels = Object.keys(values);
    const graphData = {
      data,
      labels,
      colors: [],
    };
    return graphData;
  }
  return null;
};

const FeaturePieChart = function (props) {
  const title = 'Feature Distribution Metrics';
  const {
    currentBuild,
  } = props;
  const { data, labels } = generateFeatureDistributionPieChartData(currentBuild);
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
        type="pie"
        height={350}
        max-width={500}
        /* eslint-disable-next-line prefer-object-spread */
        options={Object.assign({}, defaultOptions, { labels })}
      />
    </Panel>
  );
};

export default FeaturePieChart;
