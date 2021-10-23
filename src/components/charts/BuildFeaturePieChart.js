import React, { Component } from 'react';
import Chart from 'chart.js';
import './Charts.css';
import { getRandomColor } from '../../utility/ChartUtilities';

class BuildFeaturePieChart extends Component {
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
      this.renderBuildFeaturePieChart(this.piechart, build);
    }

    returnFeatureCount = (build) => {
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
    }

    renderBuildFeaturePieChart = (piechart, build) => {
      if (piechart !== undefined && piechart.config != null) {
        const graphData = piechart.config.data;
        // do a feature count.
        const result = this.returnFeatureCount(build);
        graphData.datasets = [{
          label: 'Features',
          data: Object.values(result),
          backgroundColor: getRandomColor(),
        }];
        graphData.labels = Object.keys(result);

        piechart.update();
      }
    }

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
