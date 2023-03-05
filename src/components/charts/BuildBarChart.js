import React, { useEffect } from 'react';
import { Chart } from 'chart.js';
import './Charts.css';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';

const BuildBarChart = function (props) {
  const buildChartRef = React.createRef();
  let barchart = null;
  const { builds } = props;

  // populate the data.
  const renderBuildBarChart = () => {
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
  };

  // update the chart with links to the build pages.
  const updateBuildChart = () => {
    const navigate = useNavigate();
    barchart.options = {
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
          const buildId = builds[item[0]._index]._id;
          navigate(`/build/?buildId=${buildId}`);
        }
      },
    };
    barchart.update();
  };

  useEffect(() => {
    const myChartRef = buildChartRef.current.getContext('2d');
    const config = {
      type: 'bar',
      data: {},
      options: {},
    };
    barchart = new Chart(myChartRef, config);
    // to trigger componentDidUpdate
    // this.setState({});
  }, []);

  useEffect(() => {
    if (barchart === undefined || barchart.data.datasets.length === 0) {
      renderBuildBarChart();
      updateBuildChart();
    }
  }, [builds]);

  return (
    <div className="graphContainer">
      <canvas id="buildMetricsChart" ref={buildChartRef} />
    </div>
  );
};

export default BuildBarChart;
