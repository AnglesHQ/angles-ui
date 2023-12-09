import React from 'react';
import Chart from 'react-apexcharts';
import { Panel, Stack } from 'rsuite';
import { useIntl } from 'react-intl';
import moment from 'moment';
// import { getBuildDurationInSeconds } from '../../../../utility/TimeUtilities';
import { useNavigate } from 'react-router-dom';

const defaultOptions = {
  chart: {
    // fontFamily: 'inherit',
    // parentHeightOffset: 0,
    toolbar: { show: false },
    animations: { enabled: false },
    stacked: true,
    stackType: 'normal',
    background: 'var(--main-panel-background)',
    foreColor: 'var(--main-panel-font-color)',
    // TODO: could look at adding some click events for filtering etc
    events: {},
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
  yaxis: [
    {
      title: {
        text: 'Number of Tests',
      },
    },
    // TODO: causes the graph to not display correctly
    // {
    //   opposite: true,
    //   title: {
    //     text: 'Execution Time (seconds)',
    //   },
    // },
  ],
  colors: ['var(--pass-color)', 'var(--skipped-color)', 'var(--error-color)', 'var(--fail-color)', '#2485C1'],
  legend: { show: true },
};

const generateResultsData = (builds) => {
  const intl = useIntl();
  const graphData = {
    data: [],
    labels: [],
  };
  const results = {
    PASS: [],
    SKIPPED: [],
    ERROR: [],
    FAIL: [],
    // executionTimes: [],
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
    // results.executionTimes.push(getBuildDurationInSeconds(build));
    graphData.labels.push(moment.utc(moment(build.start)).format('YYYY-MM-DD HH:mm:ss'));
  });
  graphData.data.push(
    {
      name: intl.formatMessage({ id: 'page.dashboard.chart.barchart.pass' }),
      data: results.PASS,
      type: 'column',
    },
    {
      name: intl.formatMessage({ id: 'page.dashboard.chart.barchart.skipped' }),
      data: results.SKIPPED,
      type: 'column',
    },
    {
      name: intl.formatMessage({ id: 'page.dashboard.chart.barchart.error' }),
      data: results.ERROR,
      type: 'column',
    },
    {
      name: intl.formatMessage({ id: 'page.dashboard.chart.barchart.fail' }),
      data: results.FAIL,
      type: 'column',
    },
    // {
    //   name: intl.formatMessage({ id: 'page.dashboard.chart.barchart.execution-time-seconds' }),
    //   data: results.executionTimes,
    //   type: 'line',
    // },
  );
  return graphData;
};

const ExecutionBarChart = function (props) {
  const { builds, title } = props;
  const reversedBuilds = [...builds].reverse();
  const navigate = useNavigate();
  const graphData = generateResultsData(builds);
  defaultOptions.chart.events.click = function (event, chartContext, config) {
    navigate(`/test-run/?buildId=${reversedBuilds[config.dataPointIndex]._id}`);
  };
  const { data, labels } = graphData;
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
        /* eslint-disable-next-line prefer-object-spread */
        options={Object.assign({}, defaultOptions, undefined, { labels })}
      />
    </Panel>
  );
};

export default ExecutionBarChart;
