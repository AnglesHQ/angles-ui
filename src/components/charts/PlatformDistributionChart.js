import React, { Component } from 'react';
import { Chart } from 'chart.js';
import './Charts.css';
import { getPeriodLabel } from '../../utility/ChartUtilities';

class PlatformDistributionChart extends Component {
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
    const { metrics, platformColors } = this.props;
    if (this.barchart === undefined || this.barchart.data.datasets.length === 0
      || prevProps.metrics !== metrics) {
      this.renderBuildBarChart(this.barchart, metrics, platformColors);
      this.updateBuildChart();
    }
  }

  // populate the data.
  renderBuildBarChart = (metrics, platformColors) => {
    if (this.barchart !== undefined && this.barchart.config != null) {
      const graphData = this.barchart.config.data;
      graphData.labels = [];
      graphData.datasets = [];
      if (Array.isArray(metrics.periods)) {
        const platformNames = new Set();
        const platformMetrics = {};
        metrics.periods.forEach((period) => {
          platformMetrics[period.id] = {};
          period.phases.forEach((phase) => {
            phase.executions.forEach((execution) => {
              if (execution.platforms && execution.platforms.length > 0) {
                execution.platforms.forEach((platform) => {
                  // add platform to set to ensure we have a unique platform names
                  platformNames.add(platform.platformName);
                  if (!platformMetrics[period.id][platform.platformName]) {
                    platformMetrics[period.id][platform.platformName] = 0;
                  }
                  platformMetrics[period.id][platform.platformName] += 1;
                });
              }
            });
          });
        });
        const platformArray = Array.from(platformNames);
        platformArray.forEach((platformName) => {
          graphData.datasets.push({
            label: platformName,
            data: [],
            backgroundColor: platformColors[platformName].color,
          });
        });
        metrics.periods.map((period) => {
          graphData.labels.push(getPeriodLabel(period, metrics.groupingPeriod));
          // unique test cases per phase.
          platformArray.forEach((platformName) => {
            if (platformMetrics[period.id][platformName]) {
              graphData.datasets[platformArray.indexOf(platformName)]
                .data.push(platformMetrics[period.id][platformName]);
            } else {
              graphData.datasets[platformArray.indexOf(platformName)].data.push(0);
            }
          });
          return graphData;
        });
      }
      this.barchart.update();
    }
  };

  // update the chart with links to the build pages.
  updateBuildChart = () => {
    this.barchart.options = {
      animation: false,
      scales: {
        xAxes: [
          {
            stacked: true,
            ticks: {
              reverse: false,
            },
          },
        ],
        yAxes: [
          {
            scaleLabel: {
              display: true,
              labelString: 'Number of test executions grouped by platform',
            },
            stacked: true,
            ticks: {
              beginAtZero: true,
              stepSize: 1,
            },
          },
        ],
      },
    };
    this.barchart.update();
  };

  render() {
    return (
      <div className="graphContainer">
        <canvas id="testPhasesMetricsChart" ref={this.testPhasesChartRef} />
      </div>
    );
  }
}

export default PlatformDistributionChart;
