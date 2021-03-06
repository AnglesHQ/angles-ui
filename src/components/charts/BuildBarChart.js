import React, { Component } from 'react';
import Chart from 'chart.js';
import './Charts.css';
import moment from 'moment';
import { withRouter } from 'react-router-dom';

class BuildBarChart extends Component {
    buildChartRef = React.createRef();

    barchart;

    constructor(props) {
      super(props);
      // console.log('constructor: ', props);
      this.state = {
        //
      };
    }

    componentDidMount() {
      const myChartRef = this.buildChartRef.current.getContext('2d');
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
      const { builds } = this.props;
      if (this.barchart === undefined || this.barchart.data.datasets.length === 0
        || prevProps.builds !== builds) {
        this.renderBuildBarChart(this.barchart, builds);
        this.updateBuildChart();
      }
    }

    // populate the data.
    renderBuildBarChart = (barchart, builds) => {
      if (barchart !== undefined && barchart.config != null) {
        const graphData = barchart.config.data;
        graphData.labels = [];
        graphData.datasets = [];
        graphData.datasets.push({ label: 'PASS', data: [], backgroundColor: '#74d600' });
        graphData.datasets.push({ label: 'FAIL', data: [], backgroundColor: '#ff0000' });
        graphData.datasets.push({ label: 'ERROR', data: [], backgroundColor: '#ff8000' });
        graphData.datasets.push({ label: 'SKIPPPED', data: [], backgroundColor: '#ffd500' });
        if (Array.isArray(builds)) {
          builds.map((build) => {
            graphData.labels.push(moment.utc(moment(build.start)).format('DD-MM-YYYY HH:mm:ss'));
            if (build.result) {
              graphData.datasets[0].data.push(build.result.PASS);
              graphData.datasets[1].data.push(build.result.FAIL);
              graphData.datasets[2].data.push(build.result.ERROR);
              graphData.datasets[3].data.push(build.result.SKIPPED);
            }
            return graphData;
          });
        }
        barchart.update();
      }
    }

    // update the chart with links to the build pages.
    updateBuildChart = () => {
      const { history, builds: localBuilds } = this.props;
      this.barchart.options = {
        animation: false,
        scales: {
          xAxes: [
            {
              stacked: true,
              ticks: {
                reverse: true,
              },
            },
          ],
          yAxes: [
            {
              scaleLabel: {
                display: true,
                labelString: 'Number of test cases',
              },
              stacked: true,
              ticks: {
                beginAtZero: true,
                stepSize: 1,
              },
            },
          ],
        },
        onClick: (evt, item) => {
          if (item[0]) {
            const buildId = localBuilds[item[0]._index]._id;
            history.push(`/build/?buildId=${buildId}`);
          }
        },
      };
      this.barchart.update();
    }

    render() {
      return (
        <div className="graphContainer">
          <canvas id="buildMetricsChart" ref={this.buildChartRef} />
        </div>
      );
    }
}

export default withRouter(BuildBarChart);
