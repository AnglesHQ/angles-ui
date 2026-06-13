import React from 'react';
import Chart from 'react-apexcharts';
import { Panel, Stack } from 'rsuite';
import { useIntl } from 'react-intl';

const STATUS_DEFINITIONS = [
  { key: 'PASS', colorVar: 'var(--pass-color)', labelId: 'page.dashboard.chart.barchart.pass' },
  { key: 'FAIL', colorVar: 'var(--fail-color)', labelId: 'page.dashboard.chart.barchart.fail' },
  { key: 'ERROR', colorVar: 'var(--error-color)', labelId: 'page.dashboard.chart.barchart.error' },
  { key: 'SKIPPED', colorVar: 'var(--skipped-color)', labelId: 'page.dashboard.chart.barchart.skipped' },
];

const generateExecutionMetricsPieChartData = (currentBuild, intl) => {
  if (currentBuild) {
    // Only include statuses with a non-zero count so the rendered slice
    // indices always align with the statusOrder array.
    const entries = STATUS_DEFINITIONS
      .map((def) => ({
        status: def.key,
        value: currentBuild.result[def.key] || 0,
        label: intl.formatMessage({ id: def.labelId }),
        color: def.colorVar,
      }))
      .filter((entry) => entry.value > 0);

    return {
      data: entries.map((e) => e.value),
      labels: entries.map((e) => e.label),
      colors: entries.map((e) => e.color),
      statusOrder: entries.map((e) => e.status),
    };
  }
  return null;
};

const buildOptions = (labels, colors, statusOrder, onStatusClick) => ({
  chart: {
    toolbar: { show: false },
    animations: { enabled: false },
    background: 'var(--main-panel-background)',
    foreColor: 'var(--main-panel-font-color)',
    events: {
      dataPointSelection: (event, chartContext, config) => {
        if (onStatusClick) {
          const { dataPointIndex, selectedDataPoints } = config;
          // selectedDataPoints[0] lists the currently-selected indices.
          // If the clicked slice is now de-selected, the array won't contain
          // dataPointIndex, so we clear the filter.
          const isNowSelected = selectedDataPoints
            && selectedDataPoints[0]
            && selectedDataPoints[0].includes(dataPointIndex);
          onStatusClick(isNowSelected ? statusOrder[dataPointIndex] : null);
        }
      },
    },
  },
  labels,
  colors,
  legend: {
    show: true,
    fontSize: '15px',
    formatter: (seriesName, opts) => `${seriesName}: <strong> ${opts.w.config.series[opts.seriesIndex]}</strong>`,
  },
  states: {
    active: {
      filter: {
        type: 'darken',
        value: 0.75,
      },
    },
  },
});

const ExecutionPieChart = function (props) {
  const {
    currentBuild,
    title,
    onStatusClick,
  } = props;
  const intl = useIntl();
  const metrics = generateExecutionMetricsPieChartData(currentBuild, intl);

  if (!metrics) return null;

  const {
    data, labels, colors, statusOrder,
  } = metrics;

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
        options={buildOptions(labels, colors, statusOrder, onStatusClick)}
      />
    </Panel>
  );
};

export default ExecutionPieChart;
