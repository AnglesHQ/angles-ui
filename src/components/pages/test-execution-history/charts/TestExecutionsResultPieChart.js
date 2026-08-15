import React from 'react';
import Chart from 'react-apexcharts';
import { Panel, Stack } from 'rsuite';
import { useIntl } from 'react-intl';
import {
  STATUS_COLORS,
  buildBaseOptions,
  buildStatusDonutPlotOptions,
  resultLegendFormatter,
} from '../../../../utility/ChartConfig';

const STATUS_ORDER = ['PASS', 'FAIL', 'ERROR', 'SKIPPED'];

const generateExecutionMetricsPieChartData = (executions, intl) => {
  const result = {
    PASS: 0,
    FAIL: 0,
    SKIPPED: 0,
    ERROR: 0,
  };
  executions.forEach((execution) => {
    result[execution.status] += 1;
  });
  const {
    PASS,
    FAIL,
    SKIPPED,
    ERROR,
  } = result;
  return {
    data: [PASS, FAIL, ERROR, SKIPPED],
    labels: [
      intl.formatMessage({ id: 'page.dashboard.chart.barchart.pass' }),
      intl.formatMessage({ id: 'page.dashboard.chart.barchart.fail' }),
      intl.formatMessage({ id: 'page.dashboard.chart.barchart.error' }),
      intl.formatMessage({ id: 'page.dashboard.chart.barchart.skipped' }),
    ],
  };
};

const buildOptions = (labels, onStatusClick, passRateLabel) => {
  const options = buildBaseOptions();
  options.chart.events = {
    dataPointSelection: (event, chartContext, config) => {
      if (onStatusClick) {
        const { dataPointIndex, selectedDataPoints } = config;
        const isNowSelected = selectedDataPoints
          && selectedDataPoints[0]
          && selectedDataPoints[0].includes(dataPointIndex);
        onStatusClick(isNowSelected ? STATUS_ORDER[dataPointIndex] : null);
      }
    },
  };
  return {
    ...options,
    colors: STATUS_COLORS,
    labels,
    plotOptions: buildStatusDonutPlotOptions(STATUS_ORDER, passRateLabel),
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

const TestExecutionsResultPieChart = function (props) {
  const {
    executions,
    title,
    onStatusClick,
  } = props;
  const intl = useIntl();
  const { data, labels } = generateExecutionMetricsPieChartData(executions, intl);
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
        options={buildOptions(labels, onStatusClick, passRateLabel)}
      />
    </Panel>
  );
};

export default TestExecutionsResultPieChart;
