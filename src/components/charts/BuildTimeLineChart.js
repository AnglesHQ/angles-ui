import moment from 'moment';
import React, { Component } from 'react';
import Chart from 'chart.js';
import './Charts.css';
import { getBuildDurationInSeconds } from '../../utility/TimeUtilities';

class BuildTimeLineChart extends Component {
    lineChartRef = React.createRef();

    lineChart;

    constructor(props) {
      super(props);
      this.state = {
        //
      };
    }

    componentDidMount() {
      const buildTimesLineChart = this.lineChartRef.current.getContext('2d');
      const config = {
        type: 'line',
        data: {},
        options: {
          animation: false,
          elements: {
            line: {
              tension: 0,
            },
          },
          scales: {
            xAxes: [
              {
                ticks: {
                  reverse: true,
                },
              },
            ],
          },
        },
      };
      this.lineChart = new Chart(buildTimesLineChart, config);
      // to trigger componentDidUpdate
      this.setState({});
    }

    componentDidUpdate(prevProps) {
      const { builds } = this.props;
      if (this.lineChart === undefined || this.lineChart.data.datasets.length === 0
        || prevProps.builds !== builds) {
        this.renderBuildLineChart(this.lineChart, builds);
        this.updateBuildLineChart();
      }
    }

    renderBuildLineChart = (lineChart, builds) => {
      if (lineChart !== undefined && lineChart.config != null) {
        const graphData = lineChart.config.data;
        graphData.labels = [];
        graphData.datasets = [];
        graphData.datasets.push({ label: 'Time', data: [], borderColor: '#0099e6' });
        if (Array.isArray(builds)) {
          builds.map((build) => {
            graphData.labels.push(moment.utc(moment(build.start)).format('DD-MM-YYYY HH:mm:ss'));
            if (build.result) {
              graphData.datasets[0].data.push(getBuildDurationInSeconds(build));
            }
            return graphData;
          });
        }
        lineChart.update();
      }
    }

    updateBuildLineChart = () => {
      if (this.lineChart.options === {}) {
        this.lineChart.options = {
          title: {
            display: true,
            text: 'Execution time across builds seconds',
          },
          elements: {
            line: {
              tension: 0,
            },
          },
          animation: false,
          scales: {
            xAxes: [
              {
                ticks: {
                  reverse: true,
                },
              },
            ],
          },
        };
        this.lineChart.update();
      }
    }

    render() {
      return (
        <div className="graphContainer">
          <canvas
            id="buildTimesLineChart"
            ref={this.lineChartRef}
          />
        </div>
      );
    }
}

export default BuildTimeLineChart;
