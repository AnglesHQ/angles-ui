import React from 'react';
import Chart from 'react-apexcharts';
import { Panel, Stack } from 'rsuite';
import { getPeriodLabel } from '../../../../utility/ChartUtilities';

const defaultOptions = {
  chart: {
    toolbar: { show: false },
    animations: { enabled: false },
    stacked: true,
    stackType: 'normal',
    background: 'var(--sub-panel-background)',
    foreColor: 'var(--sub-panel-font-color)',
  },
  plotOptions: {
    bar: {
      columnWidth: '60%',
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
    axisBorder: {
      show: true,
    },
  },
  yaxis: [
    {
      title: {
        text: 'Number of Executions',
      },
    },
  ],
  legend: { show: true },
};

const generateMetricsResultsData = (metrics) => {
  const graphData = {
    data: [],
    labels: [],
  };
  const phases = metrics.periods.map((period) => period.phases.map((phase) => phase.name)).flat();
  phases.push('undefined');
  const uniquePhases = [...new Set(phases)];
  const phasedResults = {};
  uniquePhases.forEach((phaseName) => {
    phasedResults[phaseName] = [];
  });
  metrics.periods.forEach((period) => {
    uniquePhases.forEach((phaseName) => {
      const currentPhase = period.phases.find((phase) => phase.name === phaseName);
      if (currentPhase) {
        phasedResults[phaseName].push(currentPhase.result.TOTAL || 0);
      } else {
        phasedResults[phaseName].push(0);
      }
    });
    graphData.labels.push(getPeriodLabel(period, metrics.groupingPeriod));
  });
  Object.keys(phasedResults).forEach((phaseName) => {
    graphData.data.push(
      { name: phaseName, data: phasedResults[phaseName], type: 'column' },
    );
  });
  return graphData;
};

const PhaseMetricsResultsBarChart = function (props) {
  const title = 'Executions grouped by phase';
  const { metrics } = props;
  const graphData = generateMetricsResultsData(metrics);
  const { data, labels } = graphData;
  return (
    <Panel
      className="execution-metrics-chart-panel"
      header={(
        <Stack justifyContent="space-between">
          {title}
        </Stack>
      )}
    >
      <Chart
        series={data}
        type="bar"
        height={350}
        max-width={500}
        /* eslint-disable-next-line prefer-object-spread */
        options={Object.assign({}, defaultOptions, undefined, { labels })}
      />
    </Panel>
  );
};

export default PhaseMetricsResultsBarChart;
