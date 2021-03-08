import React, { Component } from 'react';
import axios from 'axios';
import Pagination from 'react-bootstrap/Pagination';
import update from 'immutability-helper';
import BuildsTable from '../tables/BuildsTable';
import BuildBarChart from '../charts/BuildBarChart';
import BuildTimeLineChart from '../charts/BuildTimeLineChart';
import '../charts/Charts.css';

class SummaryPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      builds: undefined,
      selectedBuilds: {},
      filteredEnvironments: [],
      filteredComponents: [],
      buildCount: 0,
      currentSkip: 0,
      limit: 15,
    };
  }

  getBuildsForTeam = (teamId, skip, limit) => {
    const { filteredEnvironments, filteredComponents } = this.state;
    let requestUrl = `/build?teamId=${teamId}&skip=${skip}&limit=${limit}`;
    if (filteredEnvironments.length > 0) {
      requestUrl += `&environmentIds=${filteredEnvironments.join(',')}`;
    }
    if (filteredComponents.length > 0) {
      requestUrl += `&componentIds=${filteredComponents.join(',')}`;
    }
    return axios.get(requestUrl)
      .then((res) => this.setState({
        builds: res.data.builds,
        buildCount: res.data.count,
        currentSkip: skip,
      }));
  }

  getNextSetOfBuilds = () => {
    const { currentSkip, limit } = this.state;
    const { currentTeam } = this.props;
    this.getBuildsForTeam(currentTeam._id, (currentSkip + limit), limit);
  }

  getPreviousSetOfBuilds = () => {
    const { currentSkip, limit } = this.state;
    const { currentTeam } = this.props;
    this.getBuildsForTeam(currentTeam._id, (currentSkip - limit), limit);
  }

  componentDidUpdate = (prevProps, prevStates) => {
    // if team has changed grab new build details.
    const { currentTeam } = this.props;
    const { limit, filteredEnvironments, filteredComponents } = this.state;
    if (prevProps.currentTeam._id !== currentTeam._id) {
      this.setState({ filteredEnvironments: [], filteredComponents: [] });
      this.getBuildsForTeam(currentTeam._id, 0, limit);
    } else if (prevStates.filteredEnvironments !== filteredEnvironments
        || prevStates.filteredComponents !== filteredComponents) {
      this.getBuildsForTeam(currentTeam._id, 0, limit);
    }
  }

  toggleSelectedBuild = (build) => {
    const { selectedBuilds } = this.state;
    const updatedBuilds = update(selectedBuilds,
      { [build._id]: { $set: !selectedBuilds[build._id] } });
    this.setState({ selectedBuilds: updatedBuilds });
  }

  setFilteredEnvironments = (filteredEnvironments) => {
    this.setState({ filteredEnvironments });
  }

  setFilteredComponents = (filteredComponents) => {
    this.setState({ filteredComponents });
  }

  /*
    Selected builds will contain both ticked and unticked, so we just want the selected ones.
  */
  retrieveSelectedBuilds = () => {
    const { selectedBuilds } = this.state;
    return Object.keys(selectedBuilds).filter((key) => selectedBuilds[key] === true);
  }

  multipleBuildsSelected = () => {
    const selectedRowsArray = this.retrieveSelectedBuilds();
    return (selectedRowsArray.length > 1);
  }

  navigateToMatrix = () => {
    const { history } = this.props;
    const selectedBuildIds = this.retrieveSelectedBuilds();
    history.push(`/matrix/?buildIds=${selectedBuildIds.join(',')}`);
  }

  previousPaginationDisabled = () => {
    const { currentSkip } = this.state;
    return (currentSkip === 0);
  }

  nextPaginationDisabled = () => {
    const { currentSkip, limit, buildCount } = this.state;
    return ((currentSkip + limit) >= buildCount);
  }

  render() {
    const {
      builds,
      buildCount,
      selectedBuilds,
      currentSkip,
      limit,
    } = this.state;
    const {
      currentTeam,
      environments,
    } = this.props;
    if (!builds) {
      this.getBuildsForTeam(currentTeam._id, currentSkip, limit);
      // if no builds then don't display
      return (
        <div>
          <h1>{`Team: ${currentTeam.name}`}</h1>
          <span>Retrieving builds</span>
        </div>
      );
    }
    return (
      <div>
        <h1>{`Team: ${currentTeam.name}`}</h1>
        <div className="graphContainerParent">
          <BuildBarChart builds={builds} />
          <BuildTimeLineChart builds={builds} />
        </div>
        <h1>
          <span>Builds </span>
          <span style={{ fontSize: 15 }}>{`[Total: ${buildCount}]`}</span>
        </h1>
        <BuildsTable
          team={currentTeam}
          availableEnvironments={environments}
          builds={builds}
          currentSkip={currentSkip}
          selectedBuilds={selectedBuilds}
          retrieveSelectedBuilds={this.retrieveSelectedBuilds}
          toggleSelectedBuild={this.toggleSelectedBuild}
          setFilteredEnvironments={this.setFilteredEnvironments}
          setFilteredComponents={this.setFilteredComponents}
        />
        <div>
          <span style={{ float: 'left' }}>
            <button disabled={!this.multipleBuildsSelected()} onClick={() => this.navigateToMatrix()} type="button" className="btn btn-outline-primary">Open Matrix</button>
          </span>
          <span style={{ float: 'right' }}>
            <Pagination>
              <Pagination.Prev
                disabled={this.previousPaginationDisabled() === true}
                onClick={() => this.getPreviousSetOfBuilds()}
              />
              <Pagination.Next
                disabled={this.nextPaginationDisabled() === true}
                onClick={() => this.getNextSetOfBuilds()}
              />
            </Pagination>
          </span>
        </div>
      </div>
    );
  }
}

export default SummaryPage;
