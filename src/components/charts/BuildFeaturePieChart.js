import React, { Component } from 'react';
import Chart from 'chart.js';
import './Charts.css';

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
          backgroundColor: ['#0b4e83', '#0df23a', '#0aa19e', '#0e16df', '#0b779e', '#02193b', '#0d5fd3', '#087a0e', '#06f68a', '#0c74ed', '#01223e', '#079b37', '#0bb057', '#0cb4ab', '#0d2676', '#0de6b8', '#04e7cc', '#0b002f', '#0cac62', '#0a13de', '#056f94', '#0453fa', '#0a764f', '#0dc61d', '#07f018', '#038301', '#05967c', '#065a24', '#0d1503', '#0295e6', '#078692', '#0ecddc', '#03555a', '#0b5765', '#07bceb', '#0bc524', '#0e6075', '#085679', '#09a59b', '#071e44', '#03a685', '#0b9cee', '#07b6df', '#0bc040', '#0aded8', '#081b70', '#03434f', '#0c2ef2', '#057360', '#0a4b8a', '#0523ff', '#046ea3', '#096754', '#0ec151', '#0d0372', '#080cd1', '#0afcb5', '#02686a', '#0c2ae9', '#0e81b9', '#08eb84', '#055612', '#0e72f4', '#036c9c', '#09bac1', '#09c99c', '#0d2860', '#097a60', '#0096c7', '#03e070', '#00d634', '#04e7ce', '#052d9b', '#02856d', '#0738b1', '#0e65ff', '#09244c', '#0b40a5', '#03b6e6', '#0bd052', '#045841', '#03ddff', '#0cc549'],
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
