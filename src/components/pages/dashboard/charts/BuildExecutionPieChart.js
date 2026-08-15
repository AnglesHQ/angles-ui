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

// Slice order must match STATUS_COLORS (PASS, FAIL, ERROR, SKIPPED) so the
// donut's centre label can locate the pass slice by index.
const STATUS_ORDER = ['PASS', 'FAIL', 'ERROR', 'SKIPPED'];

const generatePieChartData = (testRunMetrics, intl) => {
  const {
    pass,
    fail,
    skipped,
    error,
  } = testRunMetrics;
  return {
    data: [pass || 0, fail || 0, error || 0, skipped || 0],
    labels: [
      intl.formatMessage({ id: 'page.dashboard.chart.barchart.pass' }),
      intl.formatMessage({ id: 'page.dashboard.chart.barchart.fail' }),
      intl.formatMessage({ id: 'page.dashboard.chart.barchart.error' }),
      intl.formatMessage({ id: 'page.dashboard.chart.barchart.skipped' }),
    ],
  };
};

const BuildExecutionPieChart = function (props) {
  const {
    title,
    testRunMetrics,
  } = props;
  const intl = useIntl();
  const { data, labels } = generatePieChartData(testRunMetrics, intl);
  const passRateLabel = intl.formatMessage({ id: 'page.test-run.execution-pie-chart.pass-rate' });

  const options = {
    ...buildBaseOptions(),
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
  };

  return (
    <Panel
      // Matches the ExecutionBarChart sharing this row, so the two panels
      // line up.
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
        type="donut"
        height={400}
        options={options}
      />
    </Panel>
  );
};

export default BuildExecutionPieChart;
