import React, { Component } from 'react';
import { Chart } from 'chart.js';
import './Charts.css';
import { getRandomColor } from '../../utility/ChartUtilities';

class BuildFeaturePieChart extends Component {
  static returnFeatureCount = (build) => {
    const values = {};
    build.suites.forEach((suite) => {
      suite.executions.forEach((execution) => {
        if (execution.feature && execution.feature !== '') {
          if (!values[execution.feature]) {
            values[execution.feature] = 0;
          }
          values[execution.feature] += 1;
        } else {
          if (!values.undefined) {
            values.undefined = 0;
          }
          values.undefined += 1;
        }
      });
    });
    return values;
  };

  chartRef = React.createRef();

  piechart;

  constructor(props) {
    super(props);
    this.state = {
      //
    };
  }

  componentDidMount() {
    const { build } = this.props;
    const myChartRef = this.chartRef.current.getContext('2d');
    this.piechart = new Chart(myChartRef, {
      type: 'pie',
      data: {},
      options: {
        animation: false,
        responsive: true,
        title: {
          display: true,
          text: 'Feature Distribution',
        },
        legend: {
          display: false,
        },
      },
    });
    this.renderBuildFeaturePieChart(build);
  }

  renderBuildFeaturePieChart = (build) => {
    if (this.piechart !== undefined && this.piechart.config != null) {
      const graphData = this.piechart.config.data;
      // do a feature count.
      const result = BuildFeaturePieChart.returnFeatureCount(build);
      graphData.datasets = [{
        label: 'Features',
        data: Object.values(result),
        backgroundColor: getRandomColor(Object.values(result).length),
      }];
      graphData.labels = Object.keys(result);

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

export default BuildFeaturePieChart;
