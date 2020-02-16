import React, { Component } from 'react'
import axios from 'axios';
import BuildResultsPieChart from '../charts/BuildResultsPieChart';
import SuiteTable from '../tables/SuiteTable';
import BuildSummary from '../tables/BuildSummary';
import '../charts/Charts.css'

class BuildPage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      //
    };
    axios.get('/build/' + this.props.match.params.id)
    .then(res => res.data)
    .then((data) => {
      this.setState({ currentBuild: data });
    })
    .catch(console.log);
  }

  componentDidMount() {

  }


  render() {
    if (!this.state.currentBuild) {
      return null;
    }
    return (
      <div >
        <h1>Build: {this.state.currentBuild.name}</h1>
        <BuildSummary build={this.state.currentBuild} />
        <div className="graphContainerParent">
          <BuildResultsPieChart build={this.state.currentBuild} />
          <BuildResultsPieChart build={this.state.currentBuild} />
        </div>
        <br/>
        <div>
          { this.state.currentBuild.suites.map((suite, index) => {
              return <SuiteTable key={index} suite={suite} />
          })}
        </div>
      </div>
    );
  }
}

export default BuildPage;
