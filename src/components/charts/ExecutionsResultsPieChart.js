import React, { Component } from 'react';
import Chart from 'chart.js';
import './Charts.css';

class ExecutionResultsPieChart extends Component {
    chartRef = React.createRef();

    piechart;

    constructor(props) {
      super(props);
      this.state = {
        //
      };
    }

    componentDidMount() {
      const { executions } = this.props;
      const myChartRef = this.chartRef.current.getContext('2d');
      this.piechart = new Chart(myChartRef, {
        type: 'pie',
        data: {},
        options: {
          animation: false,
          responsive: true,
          title: {
            display: true,
            text: 'Executions Results',
          },
        },
      });
      this.renderExecutionsBarChart(this.piechart, executions);
    }

    renderExecutionsBarChart = (piechart, executions) => {
      if (piechart !== undefined && piechart.config != null) {
        const result = {
          PASS: 0,
          FAIL: 0,
          ERROR: 0,
          SKIPPED: 0,
        };
        executions.forEach((execution) => {
          result[execution.status] += 1;
        });
        const graphData = piechart.config.data;
        graphData.datasets = [{
          label: 'Results',
          data: [result.PASS, result.FAIL, result.ERROR, result.SKIPPED],
          backgroundColor: ['#74d600', '#ff0000', '#ff8000', '#ffd500'],
        }];
        graphData.labels = ['PASS', 'FAIL', 'ERROR', 'SKIPPED'];
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

export default ExecutionResultsPieChart;
