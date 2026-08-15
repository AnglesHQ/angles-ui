import React from 'react';
import Chart from 'react-apexcharts';
import { Panel, Stack } from 'rsuite';
import { useIntl } from 'react-intl';
import { buildBaseOptions, getPaletteColor } from '../../../../utility/ChartConfig';

// `execution.feature` is optional in the API model, so executions that don't
// set one are grouped under an explicit "unspecified" bucket rather than the
// literal string "undefined" the previous version displayed.
const generateFeatureDistributionData = (currentBuild, unspecifiedLabel) => {
  if (!currentBuild) {
    return { features: [], counts: [] };
  }
  const values = {};
  currentBuild.suites.forEach((suite) => {
    suite.executions.forEach((execution) => {
      const feature = (execution.feature && execution.feature !== '')
        ? execution.feature
        : unspecifiedLabel;
      values[feature] = (values[feature] || 0) + 1;
    });
  });
  // Biggest first — a ranked bar is easier to read than API order.
  const features = Object.keys(values).sort((a, b) => values[b] - values[a]);
  return { features, counts: features.map((feature) => values[feature]) };
};

const FeatureDistributionBarChart = function (props) {
  const {
    currentBuild,
    title,
  } = props;
  const intl = useIntl();
  const unspecifiedLabel = intl.formatMessage({ id: 'page.test-run.feature-distribution-pie-chart.unspecified' });
  const seriesLabel = intl.formatMessage({ id: 'page.test-run.feature-distribution-pie-chart.executions' });
  const { features, counts } = generateFeatureDistributionData(currentBuild, unspecifiedLabel);
  const maxCount = Math.max(...counts, 1);

  const options = {
    ...buildBaseOptions(),
    plotOptions: {
      bar: {
        horizontal: true,
        distributed: true,
        borderRadius: 4,
        barHeight: '70%',
      },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: features,
      // Execution counts are whole numbers; without this Apex can label the
      // axis with fractional ticks on small builds. `max` is one step past the
      // largest bar so the longest bar ends inside the plot area rather than
      // flush against its right edge.
      labels: { formatter: (value) => `${Math.round(value)}` },
      min: 0,
      max: maxCount + 1,
      tickAmount: Math.min(6, maxCount + 1),
    },
    grid: { xaxis: { lines: { show: true } }, yaxis: { lines: { show: false } } },
    colors: features.map((feature, index) => getPaletteColor(index)),
    states: { active: { filter: { type: 'darken', value: 0.85 } } },
    legend: { show: false },
    tooltip: { y: { title: { formatter: () => `${seriesLabel}:` } } },
  };

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
        series={[{ name: seriesLabel, data: counts }]}
        type="bar"
        // Grow with the number of features so labels never collide, but keep
        // the panel aligned with the donut beside it on small builds.
        height={Math.max(280, features.length * 38 + 60)}
        options={options}
      />
    </Panel>
  );
};

export default FeatureDistributionBarChart;
