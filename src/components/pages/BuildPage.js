import React, { Component } from 'react'
import axios from 'axios';
import BuildResultsPieChart from '../charts/BuildResultsPieChart';
import SuiteTable from '../tables/SuiteTable';
import BuildSummary from '../tables/BuildSummary';
import BuildArtifacts from '../tables/BuildArtifacts';
import '../charts/Charts.css'
import queryString from 'query-string';

class BuildPage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      query: queryString.parse(this.props.location.search),
    };
    this.getBuildDetails(this.state.query.buildId);
    this.getScreenshotDetails(this.state.query.buildId);
  }

  getBuildDetails = (buildId) => {
    axios.get('/build/' + buildId)
    .then(res => res.data)
    .then((data) => {
      this.setState({ currentBuild: data });
    })
    .catch(console.log);
  }

  getScreenshotDetails = (buildId) => {
    return axios.get('/screenshot/?buildId=' + buildId)
    .then((res) =>
      this.setState({ screenshots: res.data })
    )
  }

  render() {
    if (!this.state.currentBuild) {
      return null;
    }
    return (
      <div >
        <h1>Build: {this.state.currentBuild.name}</h1>
        <BuildSummary build={this.state.currentBuild} />
        <BuildArtifacts build={this.state.currentBuild} />
        <div className="graphContainerParent">
          <BuildResultsPieChart build={this.state.currentBuild} />
          <BuildResultsPieChart build={this.state.currentBuild} />
        </div>
        <br/>
        <div>
          { this.state.currentBuild.suites.map((suite, index) => {
              return <SuiteTable key={index} suite={suite} screenshots={this.state.screenshots} />
          })}
        </div>
      </div>
    );
  }
}

export default BuildPage;
