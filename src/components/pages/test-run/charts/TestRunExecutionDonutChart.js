import React from 'react';
import Chart from 'react-apexcharts';
import { Panel, Stack } from 'rsuite';
import { useIntl } from 'react-intl';
import { buildBaseOptions, resultLegendFormatter } from '../../../../utility/ChartConfig';

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

const buildOptions = (labels, colors, statusOrder, onStatusClick, passRateLabel) => {
  const options = buildBaseOptions();
  options.chart.events = {
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
  };
  return {
    ...options,
    labels,
    colors,
    // The centre of the donut carries the pass rate — the single number most
    // people want from this chart, and one the surrounding page never states.
    plotOptions: {
      pie: {
        donut: {
          size: '68%',
          labels: {
            show: true,
            // ApexCharts writes these straight into an inline style attribute,
            // so they need concrete units — a var() reference is not resolved
            // here the way it is in a stylesheet.
            value: {
              fontSize: '30px',
              fontWeight: 700,
              offsetY: 0,
            },
            total: {
              show: true,
              showAlways: true,
              label: passRateLabel,
              fontSize: '12px',
              // The donut's built-in "total" sums every slice; we want the
              // pass share instead, so compute it from the raw series.
              formatter: (w) => {
                const series = w.globals.seriesTotals;
                const total = series.reduce((sum, value) => sum + value, 0);
                if (total === 0) {
                  return '0%';
                }
                const passIndex = statusOrder.indexOf('PASS');
                const passed = passIndex === -1 ? 0 : series[passIndex];
                return `${Math.round((passed / total) * 100)}%`;
              },
            },
          },
        },
      },
    },
    dataLabels: { enabled: false },
    legend: {
      show: true,
      position: 'bottom',
      fontSize: '14px',
      formatter: resultLegendFormatter,
    },
    states: {
      active: {
        filter: {
          type: 'darken',
          value: 0.75,
        },
      },
    },
  };
};

const TestRunExecutionDonutChart = function (props) {
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
  const passRateLabel = intl.formatMessage({ id: 'page.test-run.execution-pie-chart.pass-rate' });

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
        type="donut"
        height={280}
        options={buildOptions(labels, colors, statusOrder, onStatusClick, passRateLabel)}
      />
    </Panel>
  );
};

export default TestRunExecutionDonutChart;
