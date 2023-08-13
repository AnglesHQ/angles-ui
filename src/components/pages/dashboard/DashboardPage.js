import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BuildRequests } from 'angles-javascript-client';
import {
  DateRangePicker,
  Pagination,
  SelectPicker,
  Row,
  Col,
  Grid,
  Affix,
  Stack,
  Panel, MultiCascader, Badge,
} from 'rsuite';
import PieChartIcon from '@rsuite/icons/PieChart';
import TimeIcon from '@rsuite/icons/Time';
import FunnelIcon from '@rsuite/icons/Funnel';
import moment from 'moment';
import update from 'immutability-helper';

import queryString from 'query-string';
import { connect } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import BuildsTable from '../../tables/BuildsTable';
import ExecutionBarChart from './ExecutionBarChart';
import { getBuildDurationInSeconds } from '../../../utility/TimeUtilities';

const generateData = function (environments, components) {
  const data = [];
  data.push({
    label: 'Environments',
    value: 1,
    children: environments
      .map((environment) => ({ value: environment._id, label: environment.name })),
  });
  data.push({
    label: 'Components',
    value: 2,
    children: components
      .map((component) => ({ value: component._id, label: component.name })),
  });
  return data;
};

const FilterMenu = function (props) {
  const {
    data,
    setFilteredComponents,
    setFilteredEnvironments,
    environments,
    components,
    filteredValues,
    setFilteredValues,
  } = props;
  return (
    <MultiCascader
      style={{ width: 50 }}
      uncheckableItemValues={[1, 2]}
      placeholder={(
        <span>
          <FunnelIcon />
        </span>
      )}
      renderValue={(value, selectedItems) => (
        <span>
          <span style={{ color: '#575757' }}>
            <Badge content={selectedItems.length}>
              <FunnelIcon />
            </Badge>
          </span>
        </span>
      )}
      data={data}
      menuWidth={220}
      onChange={
        (value) => {
          setFilteredValues(value);
          setFilteredComponents(components.filter((component) => value
            .includes(component._id)).map((component) => component._id));
          setFilteredEnvironments(environments.filter((environment) => value
            .includes(environment._id)).map((environment) => environment._id));
        }
      }
      value={filteredValues}
    />
  );
};

const DashboardPage = function (props) {
  const location = useLocation();
  const navigate = useNavigate();
  const buildRequests = new BuildRequests(axios);
  const { currentTeam, teams, environments } = props;

  // query values
  const query = queryString.parse(location.search);
  const { startDate: queryStartDate, endDate: queryEndDate } = query;

  // page state
  const [builds, setBuilds] = useState(undefined);
  const [buildCount, setBuildCount] = useState(0);
  const [currentSkip, setCurrentSkip] = useState(0);
  const [limit, setLimit] = useState(15);

  // date range.
  const [startDate, setStartDate] = useState(queryStartDate ? moment(queryStartDate) : moment().subtract(90, 'days'));
  const [endDate, setEndDate] = useState(queryEndDate ? moment(queryEndDate) : moment());
  const { afterToday } = DateRangePicker;

  // filtering values
  const [selectedBuilds, setSelectedBuilds] = useState({});
  const [filteredEnvironments, setFilteredEnvironments] = useState([]);
  const [filteredComponents, setFilteredComponents] = useState([]);
  const [filteredValues, setFilteredValues] = useState([]);

  // pagination values
  const [activePage, setActivePage] = React.useState(1);
  const limitValues = [10, 15, 25, 50].map(
    (item) => ({ label: item, value: item }),
  );
  const addIndexToBuilds = (buildsToIndex, skip) => {
    buildsToIndex.forEach((build, index) => {
      build.index = index + skip + 1;
    });
    return buildsToIndex;
  };

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
        setBuilds(addIndexToBuilds(retrievedBuilds, skip));
        setBuildCount(count);
        setCurrentSkip(skip);
      });
  };

  useEffect(() => {
    if (currentTeam) {
      getBuildsForTeam(
        currentTeam._id,
        (activePage * limit) - limit,
        limit,
        filteredEnvironments,
        filteredComponents,
        startDate,
        endDate,
      );
    }
  }, [currentTeam, limit, filteredEnvironments,
    filteredComponents, startDate, endDate, activePage]);

  useEffect(() => {
    setFilteredValues([]);
  }, []);

  useEffect(() => {
    setFilteredValues([]);
  }, [environments, currentTeam]);

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

  // const handleTeamChange = (event) => {
  //   const { changeCurrentTeam } = props;
  //   changeCurrentTeam(event.target.value);
  // };

  const handleLimitChange = (newLimit) => {
    if (newLimit) {
      console.log(JSON.stringify(newLimit));
      setLimit(newLimit);
    }
  };

  // const handleDatesChange = ({ selectedStartDate, selectedEndDate }) => {
  //   setStartDate(selectedStartDate);
  //   setEndDate(selectedEndDate);
  // };
  const generateBuildData = () => {
    const graphData = {
      data: [],
      labels: [],
    };
    const results = {
      PASS: [],
      SKIPPED: [],
      ERROR: [],
      FAIL: [],
      executionTimes: [],
    };
    builds.forEach((build) => {
      const {
        PASS,
        SKIPPED,
        ERROR,
        FAIL,
      } = build.result;
      results.PASS.push(PASS);
      results.SKIPPED.push(SKIPPED);
      results.ERROR.push(ERROR);
      results.FAIL.push(FAIL);
      results.executionTimes.push(getBuildDurationInSeconds(build));
      graphData.labels.push(moment(build.start).format('YYYY-MM-DD hh:mm:ss'));
    });
    graphData.data.push(
      { name: 'Pass', data: results.PASS, type: 'column' },
      { name: 'Skipped', data: results.SKIPPED, type: 'column' },
      { name: 'Error', data: results.ERROR, type: 'column' },
      { name: 'Fail', data: results.FAIL, type: 'column' },
      { name: 'ExecutionTime', data: results.executionTimes, type: 'line' },
    );
    return graphData;
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
          <Affix>
            <Stack className="rg-stack" spacing={10}>
              <SelectPicker
                cleanable={false}
                searchable={false}
                appearance="subtle"
                data={teams.map((team) => ({ label: team.name, value: team._id }))}
              />
              <DateRangePicker
                value={[startDate.toDate(), endDate.toDate()]}
                format="dd-MMM-yyyy"
                character=" - "
                onChange={(value) => {
                  setStartDate(moment(value[0]));
                  setEndDate(moment(value[1]));
                }}
                shouldDisableDate={afterToday()}
              />
              <FilterMenu
                data={generateData(environments, currentTeam.components)}
                setFilteredComponents={setFilteredComponents}
                setFilteredEnvironments={setFilteredEnvironments}
                components={currentTeam.components}
                environments={environments}
                filteredValues={filteredValues}
                setFilteredValues={setFilteredValues}
              />
            </Stack>
          </Affix>
          <Grid fluid>
            <Row gutter={30} className="dashboard-header">
              <Col xs={8}>
                <Panel className="trend-box bg-gradient-red">
                  <PieChartIcon size="3x" className="chart-icon" />
                  <div className="title">Test Runs </div>
                  <div className="value">281,358</div>
                </Panel>
              </Col>
              <Col xs={8}>
                <Panel className="trend-box bg-gradient-green">
                  <PieChartIcon size="3x" className="chart-icon" />
                  <div className="title">Executions </div>
                  <div className="value">251,901</div>
                </Panel>
              </Col>
              <Col xs={8}>
                <Panel className="trend-box bg-gradient-blue">
                  <TimeIcon size="3x" className="chart-icon" />
                  <div className="title">Total Execution Time</div>
                  <div className="value">25,135</div>
                </Panel>
              </Col>
            </Row>
            <Row gutter={30} className="dash-row">
              <Col xs={16}>
                <ExecutionBarChart title="Test Runs" graphData={generateBuildData()} />
              </Col>
              <Col xs={8}>
                <div className="card">
                  <ExecutionBarChart title="Test Runs" graphData={generateBuildData()} />
                </div>
              </Col>
            </Row>
            <Row gutter={30} className="dash-row">
              <Col xs={24}>
                <BuildsTable
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
                    <SelectPicker data={limitValues} appearance="default" style={{ width: 120 }} defaultValue={limit} searchable={false} onChange={handleLimitChange} />
                  </span>
                  <span style={{ float: 'right' }}>
                    <Pagination
                      prev
                      last
                      next
                      first
                      layout={['total', '|', 'pager']}
                      size="md"
                      total={buildCount}
                      limit={limit}
                      activePage={activePage}
                      onChangePage={setActivePage}
                      boundaryLinks
                      ellipsis
                      maxButtons={3}
                    />
                  </span>
                </div>
              </Col>
            </Row>
          </Grid>
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
export default connect(mapStateToProps, null)(DashboardPage);
