import React, { Component } from 'react';
import Chart from 'chart.js';
import './Charts.css';

class BuildBarChart extends Component {
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
            text: 'Build Results',
          },
        },
      });
      this.renderBuildBarChart(this.piechart, build);
    }

    renderBuildBarChart = (piechart, build) => {
      if (piechart !== undefined && piechart.config != null) {
        const graphData = piechart.config.data;
        graphData.datasets = [{
          label: 'Results',
          data: [build.result.PASS, build.result.FAIL, build.result.ERROR, build.result.SKIPPED],
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

export default BuildBarChart;
