import React, { Component } from 'react';
import axios from 'axios';
import { BuildRequests } from 'angles-javascript-client';
import moment from 'moment';
import Pagination from 'react-bootstrap/Pagination';
import update from 'immutability-helper';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import queryString from 'query-string';
import { withRouter } from 'react-router-dom';
import BuildsTable from '../tables/BuildsTable';
import BuildBarChart from '../charts/BuildBarChart';
import BuildTimeLineChart from '../charts/BuildTimeLineChart';
import '../charts/Charts.css';
import DatePicker from '../elements/DatePicker';

class SummaryPage extends Component {
  constructor(props) {
    super(props);
    const { location } = this.props;
    const query = queryString.parse(location.search);
    const {
      startDate,
      endDate,
    } = query;
    this.state = {
      builds: undefined,
      selectedBuilds: {},
      filteredEnvironments: [],
      filteredComponents: [],
      buildCount: 0,
      currentSkip: 0,
      limit: 15,
      startDate: startDate ? moment(startDate) : moment().subtract(90, 'days'),
      endDate: endDate ? moment(endDate) : moment(),
    };
    this.buildRequests = new BuildRequests(axios);
  }

  componentDidMount() {
    console.log('component did mount');
    const { currentTeam } = this.props;
    const {
      limit,
      filteredEnvironments,
      filteredComponents,
      startDate,
      endDate,
    } = this.state;
    if (currentTeam && currentTeam._id) {
      this.getBuildsForTeam(currentTeam._id, 0, limit,
        filteredEnvironments, filteredComponents, startDate, endDate);
    }
  }

  componentDidUpdate = (prevProps, prevStates) => {
    console.log('component did update');
    // if team has changed grab new build details.
    const { currentTeam } = this.props;
    const {
      limit,
      filteredEnvironments,
      filteredComponents,
      startDate,
      endDate,
    } = this.state;
    const hasTeamChanged = this.hasTeamSelectionChanged(prevProps);
    const selectionChanged = this.haveAnyFiltersChanged(prevStates);
    console.log(`Team Changed [${hasTeamChanged}], Filters Changed [${selectionChanged}]`);
    if (hasTeamChanged || selectionChanged) {
      // if someone selects a new team or there was no previous team
      this.getBuildsForTeam(currentTeam._id, 0, limit,
        filteredEnvironments, filteredComponents, startDate, endDate);
    }
  }

  hasTeamSelectionChanged = (prevProps) => {
    const { currentTeam } = this.props;
    return (
      (prevProps.currentTeam === undefined && currentTeam !== undefined)
      || (prevProps.currentTeam && currentTeam && prevProps.currentTeam._id !== currentTeam._id));
  }

  haveAnyFiltersChanged = (prevStates) => {
    const {
      filteredEnvironments,
      filteredComponents,
      startDate,
      endDate,
    } = this.state;
    return (prevStates.filteredEnvironments !== filteredEnvironments
      || prevStates.filteredComponents !== filteredComponents
      || prevStates.startDate !== startDate
      || prevStates.endDate !== endDate);
  }

  getBuildsForTeam = (teamId, skip, limit, filteredEnvironments, filteredComponents,
    startDate, endDate) => {
    console.log(`Retrieving builds for team ${teamId}`);
    this.buildRequests.getBuildsWithDateFilters(teamId, filteredEnvironments,
      filteredComponents, skip, limit, startDate, endDate)
      .then(({ builds, count: buildCount }) => this.setState({
        builds,
        buildCount,
        currentSkip: skip,
      }));
  }

  getNextSetOfBuilds = () => {
    const {
      currentSkip,
      limit,
      filteredEnvironments,
      filteredComponents,
      startDate,
      endDate,
    } = this.state;
    const { currentTeam } = this.props;
    this.getBuildsForTeam(currentTeam._id, (currentSkip + limit), limit,
      filteredEnvironments, filteredComponents, startDate, endDate);
  }

  getPreviousSetOfBuilds = () => {
    const {
      currentSkip,
      limit,
      filteredEnvironments,
      filteredComponents,
      startDate,
      endDate,
    } = this.state;
    const { currentTeam } = this.props;
    this.getBuildsForTeam(currentTeam._id, (currentSkip - limit), limit,
      filteredEnvironments, filteredComponents, startDate, endDate);
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

  anyBuildsSelected = () => {
    const selectedRowsArray = this.retrieveSelectedBuilds();
    return (selectedRowsArray.length > 0);
  }

  navigateToMatrix = () => {
    const { history } = this.props;
    const selectedBuildIds = this.retrieveSelectedBuilds();
    history.push(`/matrix/?buildIds=${selectedBuildIds.join(',')}`);
  }

  updateBuildWithKeep = (buildId, keep) => this.buildRequests.setKeep(buildId, keep)

  toggleBuildsToKeep = () => {
    const { builds } = this.state;
    const selectedBuildIds = this.retrieveSelectedBuilds();

    const keepPromises = [];
    builds.forEach((build) => {
      if (selectedBuildIds.includes(build._id)) {
        const currentKeep = build.keep || false;
        /* eslint no-param-reassign: ["error", { "props": true, "ignorePropertyModificationsFor":
        ["build"] }] */
        build.keep = !currentKeep;
        keepPromises.push(this.updateBuildWithKeep(build._id, !currentKeep));
      }
    });
    Promise.all(keepPromises)
      .then(() => {
        this.setState({ builds, selectedBuilds: {} });
      });
  }

  clearSelection = () => {
    this.setState({ selectedBuilds: {} });
  }

  previousPaginationDisabled = () => {
    const { currentSkip } = this.state;
    return (currentSkip === 0);
  }

  nextPaginationDisabled = () => {
    const { currentSkip, limit, buildCount } = this.state;
    return ((currentSkip + limit) >= buildCount);
  }

  handleTeamChange = (event) => {
    const { changeCurrentTeam } = this.props;
    changeCurrentTeam(event.target.value);
  }

  handleDatesChange = ({ startDate, endDate }) => {
    this.setState({ startDate, endDate });
  };

  render() {
    const {
      builds,
      buildCount,
      selectedBuilds,
      currentSkip,
      startDate,
      endDate,
    } = this.state;
    const {
      currentTeam,
      environments,
      teams,
    } = this.props;

    if (!currentTeam || !currentTeam._id) {
      return null;
    }
    if (!builds) {
      // if no builds then don't display
      return (
        <div className="alert alert-primary" role="alert">
          <span>
            <i className="fas fa-spinner fa-pulse fa-2x" />
            <span>{` Retrieving builds for ${currentTeam.name}`}</span>
          </span>
        </div>
      );
    }
    return (
      <div>
        <h1>Builds</h1>
        <div className="metrics-form-container">
          <Form>
            <Form.Row>
              <Form.Group as={Col} className="metrics-form-group">
                <Form.Label htmlFor="teamId"><b>Team</b></Form.Label>
                <Form.Control id="teamId" as="select" value={currentTeam._id} onChange={this.handleTeamChange} className="metrics-grouping-period-select">
                  {
                    teams.map((team) => (
                      <option key={team._id} value={team._id}>
                        {team.name}
                      </option>
                    ))
                  }
                </Form.Control>
              </Form.Group>
              <Form.Group as={Col} className="metrics-form-group-period">
                <Form.Label htmlFor="periodSelect"><b>Period</b></Form.Label>
                <DatePicker
                  className="metrics-date-picker"
                  startDate={startDate}
                  endDate={endDate}
                  handleDatesChange={this.handleDatesChange}
                />
              </Form.Group>
            </Form.Row>
          </Form>
        </div>
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
            <button disabled={!this.anyBuildsSelected()} onClick={() => this.toggleBuildsToKeep()} type="button" className="btn btn-outline-primary second-button">Toggle Keep</button>
            <button disabled={!this.anyBuildsSelected()} onClick={() => this.clearSelection()} type="button" className="btn btn-outline-primary second-button">Clear Selection</button>
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

export default withRouter(SummaryPage);
