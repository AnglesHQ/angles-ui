import React, { Component } from 'react'
import BuildsTable from '../tables/BuildsTable';
import BuildBarChart from '../charts/BuildBarChart';
import BuildTimeLineChart from '../charts/BuildTimeLineChart';
import '../charts/Charts.css'

class SummaryPage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      //
    };
  }

  render() {
    return (
      <div>
        <h1>Team: {this.props.currentTeam.name}</h1>
        <div className="graphContainerParent">
          <BuildBarChart builds={this.props.builds} />
          <BuildTimeLineChart builds={this.props.builds} />
        </div>
        <h1>Builds</h1>
        <BuildsTable builds={this.props.builds} />
      </div>
    );
  }
}

export default SummaryPage;
