import React from 'react';
import Chart from 'react-apexcharts';
import { Panel, Stack } from 'rsuite';
import { useIntl } from 'react-intl';
import moment from 'moment';
import { getBuildDurationInSeconds } from '../../../../utility/TimeUtilities';
import { useRouter } from 'next/navigation';
import { STATUS_COLORS, buildBaseOptions } from '../../../../utility/ChartConfig';

// Returns a FRESH options object each call so the click handler (which closes
// over the current builds/router) is never written onto shared module state.
const buildOptions = ({
  labels,
  onPointClick,
  seriesNames,
  countAxisTitle,
  durationAxisTitle,
}) => {
  const base = buildBaseOptions();
  const { pass: passName, duration: durationName } = seriesNames;
  return {
    ...base,
    chart: {
      ...base.chart,
      stacked: true,
      stackType: 'normal',
      events: {
        click: onPointClick,
      },
    },
    plotOptions: {
      bar: {
        // columnWidth: '60%',
        // horizontal: false,
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
      tooltip: {
        enabled: true,
      },
    },
    // Bind axes by seriesName rather than by position: the four count series
    // share one stacked left axis, the execution-time line gets its own right
    // axis. Without seriesName, Apex maps yaxis entries to series by index, so
    // the line was being scaled against the test-count axis.
    yaxis: [
      {
        seriesName: passName,
        title: { text: countAxisTitle },
        min: 0,
        forceNiceScale: true,
      },
      { seriesName: passName, show: false },
      { seriesName: passName, show: false },
      { seriesName: passName, show: false },
      {
        seriesName: durationName,
        opposite: true,
        min: 0,
        forceNiceScale: true,
        title: { text: durationAxisTitle },
        labels: {
          formatter: (value) => (value === undefined || value === null
            ? value
            : Math.round(value)),
        },
      },
    ],
    colors: [...STATUS_COLORS, 'var(--color-primary)'],
    legend: { show: false },
    labels,
  };
};

const generateResultsData = (builds, intl) => {
  const graphData = {
    data: [],
    labels: [],
  };
  const results = {
    PASS: [],
    SKIPPED: [],
    ERROR: [],
    FAIL: [],
    executionTimes: [],
  };

  const buildsToReverse = [...builds];
  buildsToReverse.reverse().forEach((build) => {
    const {
      PASS,
      SKIPPED,
      ERROR,
      FAIL,
    } = build.result;
    results.PASS.push(PASS || 0);
    results.SKIPPED.push(SKIPPED || 0);
    results.ERROR.push(ERROR || 0);
    results.FAIL.push(FAIL || 0);
    results.executionTimes.push(getBuildDurationInSeconds(build));
    graphData.labels.push(moment.utc(moment(build.start)).format('YYYY-MM-DD HH:mm:ss'));
  });
  const seriesNames = {
    pass: intl.formatMessage({ id: 'page.dashboard.chart.barchart.pass' }),
    fail: intl.formatMessage({ id: 'page.dashboard.chart.barchart.fail' }),
    error: intl.formatMessage({ id: 'page.dashboard.chart.barchart.error' }),
    skipped: intl.formatMessage({ id: 'page.dashboard.chart.barchart.skipped' }),
    duration: intl.formatMessage({ id: 'page.dashboard.chart.barchart.execution-time-seconds' }),
  };
  graphData.seriesNames = seriesNames;
  graphData.data.push(
    { name: seriesNames.pass, data: results.PASS, type: 'column' },
    { name: seriesNames.fail, data: results.FAIL, type: 'column' },
    { name: seriesNames.error, data: results.ERROR, type: 'column' },
    { name: seriesNames.skipped, data: results.SKIPPED, type: 'column' },
    { name: seriesNames.duration, data: results.executionTimes, type: 'line' },
  );
  return graphData;
};

const ExecutionBarChart = function (props) {
  const { builds, title } = props;
  const intl = useIntl();
  const reversedBuilds = [...builds].reverse();
  const router = useRouter();
  const graphData = generateResultsData(builds, intl);
  const onPointClick = (event, chartContext, config) => {
    const build = reversedBuilds[config.dataPointIndex];
    if (config.dataPointIndex >= 0 && build) {
      router.push(`/test-run/?buildId=${build._id}`);
    }
  };
  const { data, labels, seriesNames } = graphData;
  return (
    <Panel
      style={{ height: '500px' }}
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
        height={425}
        options={buildOptions({
          labels,
          onPointClick,
          seriesNames,
          countAxisTitle: intl.formatMessage({ id: 'page.dashboard.chart.barchart.yaxis.number-of-tests' }),
          durationAxisTitle: seriesNames.duration,
        })}
      />
    </Panel>
  );
};

export default ExecutionBarChart;
