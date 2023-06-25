import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BuildRequests } from 'angles-javascript-client';
import { DateRangePicker } from 'rsuite';
import moment from 'moment';
import update from 'immutability-helper';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Pagination from 'react-bootstrap/Pagination';
import queryString from 'query-string';
import { connect } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart,
  YAxis,
  Bars,
  Line,
} from '@rsuite/charts';
import BuildsTable from '../tables/BuildsTable';
import '../charts/Charts.css';

const SummaryPage = function (props) {
  const location = useLocation();
  const navigate = useNavigate();
  const query = queryString.parse(location.search);
  const { startDate: queryStartDate, endDate: queryEndDate } = query;
  const [builds, setBuilds] = useState(undefined);
  const [selectedBuilds, setSelectedBuilds] = useState({});
  const [filteredEnvironments, setFilteredEnvironments] = useState([]);
  const [filteredComponents, setFilteredComponents] = useState([]);
  const [buildCount, setBuildCount] = useState(0);
  const [currentSkip, setCurrentSkip] = useState(0);
  const [limit] = useState(15);
  const [startDate, setStartDate] = useState(queryStartDate ? moment(queryStartDate) : moment().subtract(90, 'days'));
  const [endDate, setEndDate] = useState(queryEndDate ? moment(queryEndDate) : moment());
  const buildRequests = new BuildRequests(axios);
  const { currentTeam, teams, environments } = props;
  const { afterToday } = DateRangePicker;
  const getBuildsForTeam = (
    teamId,
    skip,
  ) => {
    // console.log(`Retrieving builds for team ${teamId}`);
    buildRequests.getBuildsWithDateFilters(
      teamId,
      filteredEnvironments,
      filteredComponents,
      skip,
      limit,
      startDate,
      endDate,
    )
      .then(({ builds: retrievedBuilds, count }) => {
        setBuilds(retrievedBuilds);
        setBuildCount(count);
        setCurrentSkip(skip);
      });
  };

  useEffect(() => {
    if (currentTeam) {
      getBuildsForTeam(
        currentTeam._id,
        0,
        limit,
        filteredEnvironments,
        filteredComponents,
        startDate,
        endDate,
      );
    }
  }, [currentTeam, limit, filteredEnvironments, filteredComponents, startDate, endDate]);

  const getNextSetOfBuilds = () => {
    getBuildsForTeam(
      currentTeam._id, (
        currentSkip + limit),
      limit,
      filteredEnvironments,
      filteredComponents,
      startDate,
      endDate,
    );
  };

  const getPreviousSetOfBuilds = () => {
    getBuildsForTeam(
      currentTeam._id, (
        currentSkip - limit),
      limit,
      filteredEnvironments,
      filteredComponents,
      startDate,
      endDate,
    );
  };

  const toggleSelectedBuild = (build) => {
    const updatedBuilds = update(
      selectedBuilds,
      { [build._id]: { $set: !selectedBuilds[build._id] } },
    );
    setSelectedBuilds(updatedBuilds);
  };

  /*
    Selected builds will contain both ticked and un-ticked, so we just want the selected ones.
  */
  const retrieveSelectedBuilds = () => Object.keys(selectedBuilds)
    .filter((key) => selectedBuilds[key] === true);

  const multipleBuildsSelected = () => {
    const selectedRowsArray = retrieveSelectedBuilds();
    return (selectedRowsArray.length > 1);
  };

  const anyBuildsSelected = () => {
    const selectedRowsArray = retrieveSelectedBuilds();
    return (selectedRowsArray.length > 0);
  };

  const navigateToMatrix = () => {
    const selectedBuildIds = retrieveSelectedBuilds();
    navigate(`/matrix/?buildIds=${selectedBuildIds.join(',')}`);
  };

  const updateBuildWithKeep = (buildId, keep) => buildRequests.setKeep(buildId, keep);

  const toggleBuildsToKeep = () => {
    const selectedBuildIds = retrieveSelectedBuilds();

    const keepPromises = [];
    builds.forEach((build) => {
      if (selectedBuildIds.includes(build._id)) {
        const currentKeep = build.keep || false;
        /* eslint no-param-reassign: ["error", { "props": true, "ignorePropertyModificationsFor":
        ["build"] }] */
        build.keep = !currentKeep;
        keepPromises.push(updateBuildWithKeep(build._id, !currentKeep));
      }
    });
    Promise.all(keepPromises)
      .then(() => {
        setBuilds(builds);
        setSelectedBuilds({});
      });
  };

  const clearSelection = () => {
    setSelectedBuilds({});
  };

  const previousPaginationDisabled = () => (currentSkip === 0);

  const nextPaginationDisabled = () => ((currentSkip + limit) >= buildCount);

  const handleTeamChange = (event) => {
    const { changeCurrentTeam } = props;
    changeCurrentTeam(event.target.value);
  };

  // const handleDatesChange = ({ selectedStartDate, selectedEndDate }) => {
  //   setStartDate(selectedStartDate);
  //   setEndDate(selectedEndDate);
  // };
  const generateBuildData = () => {
    const buildData = [];
    builds.forEach((build) => {
      const {
        PASS,
        SKIPPED,
        ERROR,
        FAIL,
      } = build.result;
      buildData.push([moment(build.start).format('YYYY-MM-DD'), PASS, SKIPPED, ERROR, FAIL]);
    });
    return buildData;
  };
  return (
    // eslint-disable-next-line no-nested-ternary
    (!currentTeam || !currentTeam._id) ? (
      null
    ) : (
      (!builds) ? (
        // if no builds then don't display
        <div className="alert alert-primary" role="alert">
          <span>
            <i className="fas fa-spinner fa-pulse fa-2x" />
            <span>{` Retrieving builds for ${currentTeam.name}`}</span>
          </span>
        </div>
      ) : (
        <div>
          <h1>Builds</h1>
          <div className="metrics-form-container">
            <Form>
              <Row>
                <Form.Group as={Col} className="metrics-form-group">
                  <Form.Label htmlFor="teamId"><b>Team</b></Form.Label>
                  <Form.Control id="teamId" as="select" value={currentTeam._id} onChange={handleTeamChange} className="metrics-grouping-period-select">
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
                  <Form.Group>
                    <DateRangePicker
                      value={[startDate.toDate(), endDate.toDate()]}
                      format="dd-MMM-yyyy"
                      character=" - "
                      onChange={(value) => {
                        setStartDate(moment(value[0]));
                        setEndDate(moment(value[1]));
                      }}
                      disabledDate={afterToday()}
                    />
                  </Form.Group>
                </Form.Group>
              </Row>
            </Form>
          </div>
          <div className="graphContainerParent">
            <BarChart data={generateBuildData()}>
              <YAxis minInterval={1} axisLabel={(value) => `${value}`} />
              <Bars name="Pass" color="#98dc79" stack="1" />
              <Bars name="SKIPPED" color="#2485C1" stack="1" />
              <Bars name="Error" color="#ff8000" stack="1" />
              <Bars name="Fail" color="#c61410" stack="1" />
              <Line name="Execution Time" />
            </BarChart>
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
            retrieveSelectedBuilds={retrieveSelectedBuilds}
            toggleSelectedBuild={toggleSelectedBuild}
            setFilteredEnvironments={setFilteredEnvironments}
            setFilteredComponents={setFilteredComponents}
          />
          <div>
            <span style={{ float: 'left' }}>
              <button disabled={!multipleBuildsSelected()} onClick={() => navigateToMatrix()} type="button" className="btn btn-outline-primary">Open Matrix</button>
              <button disabled={!anyBuildsSelected()} onClick={() => toggleBuildsToKeep()} type="button" className="btn btn-outline-primary second-button">Toggle Keep</button>
              <button disabled={!anyBuildsSelected()} onClick={() => clearSelection()} type="button" className="btn btn-outline-primary second-button">Clear Selection</button>
            </span>
            <span style={{ float: 'right' }}>
              <Pagination>
                <Pagination.Prev
                  disabled={previousPaginationDisabled() === true}
                  onClick={() => getPreviousSetOfBuilds()}
                />
                <Pagination.Next
                  disabled={nextPaginationDisabled() === true}
                  onClick={() => getNextSetOfBuilds()}
                />
              </Pagination>
            </span>
          </div>
        </div>
      )
    )
  );
};

const mapStateToProps = (state) => ({
  currentTeam: state.teamsReducer.currentTeam,
  teams: state.teamsReducer.teams,
  environments: state.environmentsReducer.environments,
  builds: state.buildReducer.builds,
});
export default connect(mapStateToProps, null)(SummaryPage);
