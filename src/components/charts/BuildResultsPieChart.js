import React, { Component } from 'react';
import Chart from 'chart.js';
import './Charts.css';

class BuildBarChart extends Component {
    chartRef = React.createRef();

    piechart;

    constructor(props) {
      super(props);
      this.state = {
        currentStatesFilters: [],
      };
    }

    componentDidMount() {
      const { build, filterBuilds } = this.props;
      const myChartRef = this.chartRef.current.getContext('2d');
      this.piechart = new Chart(myChartRef, {
        type: 'pie',
        data: {},
        options: {
          animation: false,
          responsive: true,
          title: {
            display: true,
            text: 'Build Results (click to filter)',
          },
          onClick: (evt) => {
            this.piechart.active.forEach((ele) => {
              // eslint-disable-next-line no-param-reassign
              ele.custom = ele.custom || {};
              if (ele.custom.backgroundColor === undefined) {
                // eslint-disable-next-line no-underscore-dangle
                const color = ele._model.backgroundColor.replace(')', ', 0.5)');
                // eslint-disable-next-line no-param-reassign
                ele.custom.backgroundColor = color;
              } else {
                // eslint-disable-next-line no-param-reassign
                delete ele.custom.backgroundColor;
              }
            });
            this.piechart.update(true);
            // filter based on selected index.
            const activePoints = this.piechart.getElementsAtEvent(evt);
            if (activePoints.length > 0) {
              const { currentStatesFilters } = this.state;
              const selectedIndex = activePoints[0]._index;
              const state = this.piechart.data.labels[selectedIndex];
              if (currentStatesFilters.includes(state)) {
                const index = currentStatesFilters.indexOf(state);
                if (index > -1) {
                  currentStatesFilters.splice(index, 1);
                }
              } else {
                currentStatesFilters.push(state);
              }
              this.setState({ currentStatesFilters });
              filterBuilds(currentStatesFilters);
            }
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
