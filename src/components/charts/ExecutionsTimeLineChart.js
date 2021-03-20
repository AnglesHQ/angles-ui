import moment from 'moment';
import React, { Component } from 'react';
import Chart from 'chart.js';
import './Charts.css';
import { getBuildDurationInSeconds } from '../../utility/TimeUtilities';

class ExecutionsTimeLineChart extends Component {
    lineChartRef = React.createRef();

    lineChart;

    constructor(props) {
      super(props);
      this.state = {
        //
      };
    }

    componentDidMount() {
      const executionTimesLineChart = this.lineChartRef.current.getContext('2d');
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
      this.lineChart = new Chart(executionTimesLineChart, config);
      // to trigger componentDidUpdate
      this.setState({});
    }

    componentDidUpdate(prevProps) {
      const { builds, executions } = this.props;
      if (this.lineChart === undefined || this.lineChart.data.datasets.length === 0
        || prevProps.builds !== builds) {
        this.renderExecutionsLineChart(this.lineChart, executions);
        this.updateExecutionLineChart();
      }
    }

    renderExecutionsLineChart = (lineChart, executions) => {
      if (lineChart !== undefined && lineChart.config != null) {
        const graphData = lineChart.config.data;
        graphData.labels = [];
        graphData.datasets = [];
        graphData.datasets.push({ label: 'Time', data: [], borderColor: '#0099e6' });
        if (Array.isArray(executions)) {
          executions.map((execution) => {
            graphData.labels.push(moment.utc(moment(execution.start)).format('DD-MM-YYYY HH:mm:ss'));
            graphData.datasets[0].data.push(getBuildDurationInSeconds(execution));
            return graphData;
          });
        }
        lineChart.update();
      }
    }

    updateExecutionLineChart = () => {
      if (this.lineChart.options === {}) {
        this.lineChart.options = {
          title: {
            display: true,
            text: 'Execution time in seconds',
          },
          elements: {
            line: {
              tension: 0,
            },
          },
          animation: false,
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true,
              },
            }],
            xAxes: [
              {
                ticks: {
                  reverse: true,
                  maxRotation: 90,
                  minRotation: 30,
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
            id="executionTimesLineChart"
            ref={this.lineChartRef}
          />
        </div>
      );
    }
}

export default ExecutionsTimeLineChart;
