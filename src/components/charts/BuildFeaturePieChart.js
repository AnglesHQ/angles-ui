import React, { Component } from 'react'
import Chart from "chart.js";
import './Charts.css'

class BuildFeaturePieChart extends Component {

    chartRef = React.createRef();
    piechart;

    constructor(props) {
      super(props);
      this.state = {
         //
      };
    }

    returnFeatureCount = (build) => {
        let values = {}
        build.suites.forEach((suite) => {
          suite.executions.forEach((execution) => {
            if (execution.feature && execution.feature !== "") {
                if (!values[execution.feature])
                  values[execution.feature] = 0;
              values[execution.feature]++;
            } else {
              if (!values.undefined)
                values.undefined = 0;

              values.undefined++;
            }
          })
        })
        return values;
    }

    renderBuildFeaturePieChart = (piechart, build) => {
      if (piechart !== undefined && piechart.config != null) {
        let graphData = piechart.config.data;
        //do a feature count.
        let result = this.returnFeatureCount(build);
         graphData.datasets = [{
             label: 'Features',
             data: Object.values(result),
         }];
         graphData.labels =  Object.keys(result);

         piechart.update();
       }
    }

    componentDidMount() {
      const myChartRef = this.chartRef.current.getContext("2d");
      this.piechart = new Chart(myChartRef, {
          type: "pie",
          data: {},
          options: {
              responsive: true,
              title:{
                  display: true,
                  text: "Feature Distribution"
              }
          }
      });

    }

    render() {
        this.renderBuildFeaturePieChart(this.piechart, this.props.build);
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

export default BuildFeaturePieChart;
