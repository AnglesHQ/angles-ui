import React, { Component } from 'react'
import BuildsTable from '../tables/BuildsTable';
import BuildBarChart from '../charts/BuildBarChart';
import BuildTimeLineChart from '../charts/BuildTimeLineChart';
import '../charts/Charts.css'
import axios from 'axios';
import Pagination from 'react-bootstrap/Pagination';
import update from 'immutability-helper';
import { withRouter} from 'react-router-dom';

class SummaryPage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      builds: undefined,
      selectedBuilds: {},
      buildCount: 0,
    };
    this.getBuildsForTeam(this.props.currentTeam._id);
  }

  getBuildsForTeam(teamId) {
    return axios.get('/build?teamId=' + teamId)
    .then((res) =>
      this.setState({ builds: res.data.builds , buildCount: res.data.count })
    )
  }

  componentDidUpdate(prevProps) {
    // if team has changed grab new build details.
    if (prevProps.currentTeam._id !== this.props.currentTeam._id) {
      this.getBuildsForTeam(this.props.currentTeam._id);
    }
  }

  toggleSelectedBuild(build) {
    let selectedBuilds = update(this.state.selectedBuilds, { [build._id]: {$set: !this.state.selectedBuilds[build._id]}});
    this.setState( { selectedBuilds } );
  }

  retrievSelectedBuilds() {
    return Object.keys(this.state.selectedBuilds)
      .reduce((object, key) => {
        this.state.selectedBuilds[key] === true && (object[key] = this.state.selectedBuilds[key]);
        return object;
      }, {});
  }

  multipleBuildsSelected() {
    let selectedRowsArray = this.retrievSelectedBuilds();
    return (Object.keys(selectedRowsArray).length > 1);
  }

  navigateToMatrix() {
    let selectedBuildIds = this.retrievSelectedBuilds();
    this.props.history.push(`/matrix/?buildIds=${Object.keys(selectedBuildIds).join(",")}`)
  }


  render() {
    if (!this.state.builds) {
      // if no builds then don't display
      return <div><h1>Team: {this.props.currentTeam.name}</h1><span>Retrieving builds</span></div>;
    }
    return (
      <div>
        <h1>Team: {this.props.currentTeam.name}</h1>
        <div className="graphContainerParent">
          <BuildBarChart builds={this.state.builds} />
          <BuildTimeLineChart builds={this.state.builds} />
        </div>
        <h1>Builds</h1>
        <BuildsTable builds={this.state.builds} selectedBuilds={this.state.selectedBuilds} retrievSelectedBuilds={this.retrievSelectedBuilds.bind(this)} toggleSelectedBuild={this.toggleSelectedBuild.bind(this)} />
        <div>
          <span style={{ float: "left" }}><button disabled={ !this.multipleBuildsSelected() } onClick={() => this.navigateToMatrix() } type="button" className="btn btn-outline-primary">Open Matrix</button></span>
          <span style={{ float: "right" }}>
            <Pagination>
              <Pagination.First />
              <Pagination.Prev />
              <Pagination.Item>{1}</Pagination.Item>
              <Pagination.Ellipsis />
              <Pagination.Item>{20}</Pagination.Item>
              <Pagination.Next />
              <Pagination.Last />
            </Pagination>
          </span>
        </div>
      </div>
    );
  }
}

export default withRouter(SummaryPage);
