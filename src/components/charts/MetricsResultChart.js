import React, { Component } from 'react';
import Chart from 'chart.js';
import './Charts.css';
import { withRouter } from 'react-router-dom';
import { getPeriodLabel } from '../../utility/ChartUtilities';

class TestPhasesChart extends Component {
  resultMetricsChartRef = React.createRef();

  barchart;

  constructor(props) {
    super(props);
    this.state = {
      //
    };
  }

  componentDidMount() {
    const myChartRef = this.resultMetricsChartRef.current.getContext('2d');
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
      graphData.datasets.push({ label: 'PASS', data: [], backgroundColor: '#74d600' });
      graphData.datasets.push({ label: 'FAIL', data: [], backgroundColor: '#ff0000' });
      graphData.datasets.push({ label: 'ERROR', data: [], backgroundColor: '#ff8000' });
      graphData.datasets.push({ label: 'SKIPPPED', data: [], backgroundColor: '#ffd500' });
      if (Array.isArray(metrics.periods)) {
        metrics.periods.map((period) => {
          graphData.labels.push(getPeriodLabel(period, metrics.groupingPeriod));
          if (period.result) {
            graphData.datasets[0].data.push(period.result.PASS);
            graphData.datasets[1].data.push(period.result.FAIL);
            graphData.datasets[2].data.push(period.result.ERROR);
            graphData.datasets[3].data.push(period.result.SKIPPED);
          }
          return graphData;
        });
      }
      barchart.update();
    }
  };

  // update the chart with links to the build pages.
  updateBuildChart = () => {
    // const { history, metrics } = this.props;
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
              labelString: 'Number of test executions',
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
        <canvas id="resultMetricsChart" ref={this.resultMetricsChartRef} />
      </div>
    );
  }
}

export default withRouter(TestPhasesChart);
