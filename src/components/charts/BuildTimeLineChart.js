import React, { Component } from 'react'
import Chart from "chart.js";
import './Charts.css'
import moment from 'moment'

class BuildTimeLineChart extends Component {

    chartRef = React.createRef();
    lineChart;

    constructor(props) {
      super(props);
      this.state = {
         //
      };
    }
    getBuildDurationInMinutes(build) {
      if (build.end && build.start) {
        const start = moment(build.start);
        const end = moment(build.end);
        var duration = moment.duration(end.diff(start));
        return duration.asMinutes();
      }
      return 0;
    }

    renderBuildLineChart(lineChart, builds) {
      if (lineChart !== undefined && lineChart.config != null) {
        let graphData = lineChart.config.data;
        graphData.labels = [];
        graphData.datasets = [];
        graphData.datasets.push({ label: 'Time', data: [], borderColor: '#0099e6'})
        if (Array.isArray(builds)) {
          builds.map((build, index) => {
            graphData.labels.push(moment.utc(moment(build.start)).format("DD-MM-YYYY HH:mm:ss"));
            if (build.result) {
              graphData.datasets[0].data.push(this.getBuildDurationInMinutes(build));
            }
            return graphData;
          });
        }
        lineChart.update();
      }
    }

    componentDidMount() {
      const myChartRef = this.chartRef.current.getContext("2d");
      this.lineChart = new Chart(myChartRef, {
          type: "line",
          data: {},
          options: {
            title: {
              display: true,
              text: 'Execution time across builds minutes'
            }
          }
      });
    }

    render() {
        this.renderBuildLineChart(this.lineChart, this.props.builds);
        return (
          <div className="graphContainer">
            <canvas
              id="myChart"
              ref={this.chartRef}
            />
          </div>
        )
    }
}

export default BuildTimeLineChart;
