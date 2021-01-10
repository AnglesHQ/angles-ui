import React, { Component } from 'react'
import Chart from "chart.js";
import './Charts.css'
import { getBuildDurationInSeconds } from '../../utility/TimeUtilities'
import moment from 'moment'

class BuildTimeLineChart extends Component {

    lineChartRef = React.createRef();
    lineChart;

    constructor(props) {
      super(props);
      this.state = {
         //
      };
    }

    renderBuildLineChart = (lineChart, builds) => {
      if (lineChart !== undefined && lineChart.config != null) {
        console.log('Rendering Linechart as its available');
        let graphData = lineChart.config.data;
        graphData.labels = [];
        graphData.datasets = [];
        graphData.datasets.push({ label: 'Time', data: [], borderColor: '#0099e6'})
        if (Array.isArray(builds)) {
          builds.map((build, index) => {
            graphData.labels.push(moment.utc(moment(build.start)).format("DD-MM-YYYY HH:mm:ss"));
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
      if (this.lineChart.options === {}) {}
      this.lineChart.options = {
        title: {
          display: true,
          text: 'Execution time across builds seconds'
        },
        elements: {
            line: {
                tension: 0
            }
        }
      }
      this.lineChart.update();
    }

    componentDidUpdate(prevProps) {
      if (this.lineChart === undefined || this.lineChart.data.datasets.length === 0 || prevProps.builds !== this.props.builds) {
        this.renderBuildLineChart(this.lineChart, this.props.builds);
        this.updateBuildLineChart();
      }
    }

    componentDidMount() {
      const buildTimesLineChart = this.lineChartRef.current.getContext("2d");
      const config = {
          type: "line",
          data: {},
          options: {
            elements: {
                line: {
                    tension: 0
                }
            }
          }
      };
      this.lineChart = new Chart(buildTimesLineChart, config);
      // to trigger componentDidUpdate
      this.setState({});
    }

    render() {
        return (
          <div className="graphContainer">
            <canvas
              id="buildTimesLineChart"
              ref={this.lineChartRef}
            />
          </div>
        )
    }
}

export default BuildTimeLineChart;
