import React, { Component } from 'react';
import Chart from 'chart.js';
import './Charts.css';
import { withRouter } from 'react-router-dom';
import { getPeriodLabel, getRandomColor } from '../../utility/ChartUtilities';

class TestPhasesChart extends Component {
    testPhasesChartRef = React.createRef();

    barchart;

    constructor(props) {
      super(props);
      this.state = {
        //
      };
    }

    componentDidMount() {
      const myChartRef = this.testPhasesChartRef.current.getContext('2d');
      const config = {
        type: 'bar',
        data: {},
        options: {},
      };
      this.barchart = new Chart(myChartRef, config);
      // to trigger componentDidUpdate
      this.setState({});
    }

    componentDidUpdate(prevProps) {
      const { metrics } = this.props;
      if (this.barchart === undefined || this.barchart.data.datasets.length === 0
        || prevProps.metrics !== metrics) {
        this.renderBuildBarChart(this.barchart, metrics);
        this.updateBuildChart();
      }
    }

    // populate the data.
    renderBuildBarChart = (barchart, metrics) => {
      if (barchart !== undefined && barchart.config != null) {
        const graphData = barchart.config.data;
        graphData.labels = [];
        graphData.datasets = [];
        if (Array.isArray(metrics.periods)) {
          const uniquePhases = new Set();
          metrics.periods.forEach((period) => {
            period.phases.forEach((phase) => {
              uniquePhases.add(phase.name);
            });
          });
          const phaseArray = Array.from(uniquePhases);
          const colorMap = { colors: [] };
          phaseArray.forEach((phaseName) => {
            const color = getRandomColor(1)[0];
            colorMap.colors.push(color);
            colorMap[phaseName] = { color };
            graphData.datasets.push({
              label: phaseName,
              data: [],
              backgroundColor: colorMap[phaseName].color,
            });
          });
          metrics.periods.map((period) => {
            graphData.labels.push(getPeriodLabel(period, metrics.groupingPeriod));
            // unique test cases per phase.
            phaseArray.forEach((phaseName) => {
              const currentPhase = period.phases.find((phase) => phase.name === phaseName);
              if (currentPhase) {
                graphData.datasets[phaseArray.indexOf(phaseName)]
                  .data.push(currentPhase.result.TOTAL);
              } else {
                graphData.datasets[phaseArray.indexOf(phaseName)].data.push(0);
              }
            });
            return graphData;
          });
        }
        barchart.update();
      }
    }

    // update the chart with links to the build pages.
    updateBuildChart = () => {
      // const { history, metrics } = this.props;
      this.barchart.options = {
        animation: false,
        scales: {
          xAxes: [
            {
              stacked: false,
              ticks: {
                reverse: false,
              },
            },
          ],
          yAxes: [
            {
              scaleLabel: {
                display: true,
                labelString: 'Number of test executions (per phase)',
              },
              stacked: false,
              ticks: {
                beginAtZero: true,
                stepSize: 1,
              },
            },
          ],
        },
      };
      this.barchart.update();
    }

    render() {
      return (
        <div className="graphContainer">
          <canvas id="testPhasesMetricsChart" ref={this.testPhasesChartRef} />
        </div>
      );
    }
}

export default withRouter(TestPhasesChart);
