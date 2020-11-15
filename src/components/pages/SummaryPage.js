import React, { Component } from 'react'
import BuildsTable from '../tables/BuildsTable';
import BuildBarChart from '../charts/BuildBarChart';
import BuildTimeLineChart from '../charts/BuildTimeLineChart';
import '../charts/Charts.css'
import axios from 'axios';
import Pagination from 'react-bootstrap/Pagination';
import update from 'immutability-helper';

class SummaryPage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      builds: undefined,
      selectedBuilds: {},
      buildCount: 0,
      currentSkip: 0,
      limit: 10,
    };
  }

  getBuildsForTeam = (teamId, skip, limit) => {
    return axios.get(`/build?teamId=${teamId}&skip=${skip}&limit=${limit}`)
    .then((res) =>
      this.setState({
        builds: res.data.builds ,
        buildCount: res.data.count ,
        currentSkip: skip ,
      })
    )
  }

  getNextSetOfBuilds = () => {
    this.getBuildsForTeam(this.props.currentTeam._id, (this.state.currentSkip + this.state.limit), this.state.limit);
  }

  getPreviousSetOfBuilds = () => {
    this.getBuildsForTeam(this.props.currentTeam._id, (this.state.currentSkip - this.state.limit), this.state.limit);
  }

  componentDidUpdate = (prevProps) => {
    // if team has changed grab new build details.
    if (prevProps.currentTeam._id !== this.props.currentTeam._id) {
      this.getBuildsForTeam(this.props.currentTeam._id, 0, this.state.limit);
    }
  }

  toggleSelectedBuild = (build) => {
    let selectedBuilds = update(this.state.selectedBuilds, { [build._id]: {$set: !this.state.selectedBuilds[build._id]}});
    this.setState( { selectedBuilds } );
  }

  retrievSelectedBuilds = () => {
    return Object.keys(this.state.selectedBuilds)
      .reduce((object, key) => {
        this.state.selectedBuilds[key] === true && (object[key] = this.state.selectedBuilds[key]);
        return object;
      }, {});
  }

  multipleBuildsSelected = () => {
    let selectedRowsArray = this.retrievSelectedBuilds();
    return (Object.keys(selectedRowsArray).length > 1);
  }

  navigateToMatrix = () => {
    let selectedBuildIds = this.retrievSelectedBuilds();
    this.props.history.push(`/matrix/?buildIds=${Object.keys(selectedBuildIds).join(",")}`)
  }

  previousPaginationDisabled = () => {
    return (this.state.currentSkip === 0);
  }

  nextPaginationDisabled = () => {
    return ((this.state.currentSkip + this.state.limit) > this.state.buildCount);
  }

  render() {
    if (!this.state.builds) {
      this.getBuildsForTeam(this.props.currentTeam._id, this.state.currentSkip, this.state.limit);
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
        <h1>Builds <span style={{fontSize: 15}}>[Total: {this.state.buildCount}]</span></h1>
        <BuildsTable builds={this.state.builds} currentSkip={this.state.currentSkip} selectedBuilds={this.state.selectedBuilds} retrievSelectedBuilds={this.retrievSelectedBuilds.bind(this)} toggleSelectedBuild={this.toggleSelectedBuild.bind(this)} />
        <div>
          <span style={{ float: "left" }}><button disabled={ !this.multipleBuildsSelected() } onClick={() => this.navigateToMatrix() } type="button" className="btn btn-outline-primary">Open Matrix</button></span>
          <span style={{ float: "right" }}>
            <Pagination>
              <Pagination.Prev disabled={this.previousPaginationDisabled() === true ? true : false} onClick={() => this.getPreviousSetOfBuilds() }  />
              <Pagination.Next disabled={this.nextPaginationDisabled() === true ? true : false} onClick={() => this.getNextSetOfBuilds() } />
            </Pagination>
          </span>
        </div>
      </div>
    );
  }
}

export default SummaryPage;
