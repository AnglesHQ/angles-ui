import React, { Component } from 'react'
import Chart from "chart.js";
import './Charts.css'
import moment from 'moment'

class BuildBarChart extends Component {

    chartRef = React.createRef();
    barchart;

    constructor(props) {
      super(props);
      this.state = {
         //
      };
    }

    renderBuildBarChart(barchart, builds) {
      if (barchart !== undefined && barchart.config != null) {
        let graphData = barchart.config.data;
        graphData.labels = [];
        graphData.datasets = [];
        graphData.datasets.push({ label: 'PASS', data: [], backgroundColor: '#74d600'})
        graphData.datasets.push({ label: 'FAIL', data: [], backgroundColor: '#ff0000'});
        graphData.datasets.push({ label: 'ERROR', data: [], backgroundColor: '#ff8000'});
        graphData.datasets.push({ label: 'SKIPPPED', data: [], backgroundColor: '#ffd500'});
        if (Array.isArray(builds)) {
          builds.map((build, index) => {
            graphData.labels.push(moment.utc(moment(build.start)).format("DD-MM-YYYY HH:mm:ss"));
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

    componentDidMount() {
      const myChartRef = this.chartRef.current.getContext("2d");
      this.barchart = new Chart(myChartRef, {
          type: "bar",
          data: {},
          options: {
            scales: {
              xAxes: [{ stacked: true }],
              yAxes: [
                {
                  scaleLabel: {
                    display: true,
                    labelString: 'Number of test cases'
                  },
                  stacked: true,
                  ticks: {
                      beginAtZero: true,
                      stepSize: 1
                  }
                }
              ]
            }
          }
      });

    }

    render() {
        this.renderBuildBarChart(this.barchart, this.props.builds);
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

export default BuildBarChart;
