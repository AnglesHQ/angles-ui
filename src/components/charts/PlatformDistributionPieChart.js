import React, { Component } from 'react';
import { Chart } from 'chart.js';
import './Charts.css';

class PlatformDistributionPieChart extends Component {
  chartRef = React.createRef();

  piechart;

  constructor(props) {
    super(props);
    this.state = {
      //
    };
  }

  componentDidMount() {
    const { metrics, platformColors } = this.props;
    const myChartRef = this.chartRef.current.getContext('2d');
    this.piechart = new Chart(myChartRef, {
      type: 'pie',
      data: {},
      options: {
        animation: false,
        responsive: true,
        title: {
          display: true,
          text: 'Platform Distribution',
        },
      },
    });
    this.renderPieChart(metrics, platformColors);
  }

  renderPieChart = (metrics, platformColors) => {
    const result = {};
    if (this.piechart !== undefined && this.piechart.config != null) {
      metrics.periods.forEach((period) => {
        period.phases.forEach((phase) => {
          phase.executions.forEach((execution) => {
            if (execution.platforms && execution.platforms.length > 0) {
              execution.platforms.forEach((platform) => {
                if (!result[platform.platformName]) {
                  result[platform.platformName] = 0;
                }
                result[platform.platformName] += 1;
              });
            }
          });
        });
      });
      const graphData = this.piechart.config.data;
      const data = [];
      const labels = [];
      Object.keys(result).forEach((platformName) => {
        data.push(result[platformName]);
        labels.push(platformName);
      });
      graphData.datasets = [{
        label: 'Results',
        data,
        backgroundColor: platformColors.colors,
      }];
      graphData.labels = labels;
      this.piechart.update();
    }
  };

  render() {
    return (
      <div className="graphContainer">
        <canvas
          id="myChart"
          ref={this.chartRef}
        />
      </div>
    );
  }
}

export default PlatformDistributionPieChart;
