import React from 'react';
import Chart from 'react-apexcharts';
import { Panel, Stack } from 'rsuite';
import { useIntl } from 'react-intl';
import { STATUS_COLORS, getPlatformLabel } from '../../../../utility/ChartConfig';

// One series per status, in the same order as STATUS_COLORS, so each platform's
// bar is split into its pass/fail/error/skipped make-up.
const STATUS_ORDER = ['PASS', 'FAIL', 'ERROR', 'SKIPPED'];

const STATUS_LABEL_IDS = {
  PASS: 'page.dashboard.chart.barchart.pass',
  FAIL: 'page.dashboard.chart.barchart.fail',
  ERROR: 'page.dashboard.chart.barchart.error',
  SKIPPED: 'page.dashboard.chart.barchart.skipped',
};

// Counts executions per platform, broken down by status. An execution can list
// several platforms, so it contributes one count to each of them.
const generatePlatformStatusData = (executions) => {
  const perPlatform = {};
  executions.forEach((execution) => {
    if (execution.platforms && execution.platforms.length > 0) {
      execution.platforms.forEach((platform) => {
        const label = getPlatformLabel(platform);
        if (!perPlatform[label]) {
          perPlatform[label] = {
            PASS: 0, FAIL: 0, ERROR: 0, SKIPPED: 0,
          };
        }
        if (perPlatform[label][execution.status] !== undefined) {
          perPlatform[label][execution.status] += 1;
        }
      });
    }
  });

  // Busiest platform first, so the chart reads top-down by volume.
  const platforms = Object.keys(perPlatform).sort((a, b) => {
    const total = (counts) => STATUS_ORDER.reduce((sum, key) => sum + counts[key], 0);
    return total(perPlatform[b]) - total(perPlatform[a]);
  });

  return { platforms, perPlatform };
};

const TestExecutionPlatformBarChart = function (props) {
  const {
    executions,
    title,
    yaxisTitle,
    xaxisTitle,
  } = props;
  const intl = useIntl();

  const { platforms, perPlatform } = generatePlatformStatusData(executions);

  // Drop statuses that are absent everywhere, so the legend only offers what is
  // actually present (a run with no errors gets no empty "Error" entry).
  const activeStatuses = STATUS_ORDER
    .filter((status) => platforms.some((platform) => perPlatform[platform][status] > 0));

  const series = activeStatuses.map((status) => ({
    name: intl.formatMessage({ id: STATUS_LABEL_IDS[status] }),
    data: platforms.map((platform) => perPlatform[platform][status]),
  }));

  const colors = activeStatuses.map((status) => STATUS_COLORS[STATUS_ORDER.indexOf(status)]);

  // Largest stack total, used to pin the axis. Apex otherwise interpolates
  // fractional ticks on small ranges which, once rounded for display, render as
  // duplicate labels ("0 1 1 2 2 3"). Pinning `max` also stops it padding the
  // axis to roughly double the data and leaving the bars using half the width.
  const largestStack = platforms.reduce((max, platform) => {
    const total = STATUS_ORDER.reduce((sum, key) => sum + perPlatform[platform][key], 0);
    return Math.max(max, total);
  }, 0);

  // Ticks must divide the range exactly, or the interpolated values are
  // fractional and collapse into duplicates once rounded. Rather than accept
  // whatever divisor the raw total happens to have (a prime like 11 would
  // leave a single tick), round the axis up to the nearest value that divides
  // cleanly — at most 4 over, so the bars still fill the plot.
  const niceMax = (value) => {
    if (value <= 1) return 1;
    for (let candidate = value; candidate <= value + 4; candidate += 1) {
      if ([10, 8, 6, 5, 4, 3, 2].some((d) => candidate % d === 0)) return candidate;
    }
    return value;
  };
  const maxTotal = niceMax(largestStack);
  const tickAmount = [10, 8, 6, 5, 4, 3, 2]
    .find((candidate) => maxTotal % candidate === 0) || 1;

  const options = {
    chart: {
      toolbar: { show: false },
      zoom: { enabled: false },
      animations: { enabled: false },
      stacked: true,
      background: 'var(--main-panel-background)',
      foreColor: 'var(--main-panel-font-color)',
    },
    plotOptions: {
      bar: {
        horizontal: true,
        // `distributed` colours by bar, which would override the per-status
        // series colours that make the stack readable.
        distributed: false,
        borderRadius: 4,
        barHeight: '70%',
      },
    },
    dataLabels: {
      // Segment counts, blanked on zero-height segments so empty stacks stay
      // clean.
      enabled: true,
      formatter: (value) => (value > 0 ? value : ''),
      style: { fontSize: '12px', fontWeight: 600 },
    },
    xaxis: {
      categories: platforms,
      title: { text: xaxisTitle },
      labels: { formatter: (value) => `${Math.round(value)}` },
      axisBorder: { show: true },
      min: 0,
      max: maxTotal,
      tickAmount,
    },
    yaxis: {
      title: { text: yaxisTitle },
    },
    colors,
    legend: {
      show: true,
      position: 'bottom',
    },
    tooltip: {
      shared: true,
      intersect: false,
    },
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
        series={series}
        type="bar"
        height={Math.max(200, platforms.length * 50 + 100)}
        options={options}
      />
    </Panel>
  );
};

export default TestExecutionPlatformBarChart;
