import React, { useEffect, useState } from 'react';
import Moment from 'react-moment';
// import { TagPicker } from 'rsuite';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import { MultiSelect } from 'react-multi-select-component';
import Popover from 'react-bootstrap/Popover';
import ProgressBar from 'react-bootstrap/ProgressBar';
import TimeIcon from '@rsuite/icons/Time';
import TreeIcon from '@rsuite/icons/Tree';
import { Badge, FlexboxGrid } from 'rsuite';

import { getDuration } from '../../utility/TimeUtilities';
import ArtifactsDetailsTable from './ArtifactsDetailsTable';

const BuildsTable = function (props) {
  const componentOverrideStrings = {
    selectSomeItems: 'Components...',
    allItemsAreSelected: 'All components',
  };
  const environmentOverrideStrings = {
    selectSomeItems: 'Environments...',
    allItemsAreSelected: 'All environments',
  };
  const [environments, setEnvironments] = useState([]);
  const [components, setComponents] = useState([]);
  const [selectedEnvironments, setSelectedEnvironments] = useState([]);
  const [selectedComponents, setSelectedComponents] = useState([]);
  const {
    team,
    availableEnvironments,
    selectedBuilds,
    retrieveSelectedBuilds,
    setFilteredEnvironments,
    setFilteredComponents,
  } = props;

  const resetEnvironmentsForTableFilter = (allEnvironments) => {
    const uniqueEnvironments = {};
    allEnvironments.forEach((environment) => {
      uniqueEnvironments[environment._id] = environment.name;
    });
    const environmentsToSet = [];
    Object.keys(uniqueEnvironments).forEach((key) => {
      environmentsToSet.push({ label: uniqueEnvironments[key], value: key });
    });
    environmentsToSet.sort((a, b) => ((a.label > b.label) ? 1 : -1));
    setEnvironments(environmentsToSet);
    setSelectedEnvironments([]);
  };

  const resetComponentsForTableFilter = (teamWithComponents) => {
    const uniqueComponents = {};
    teamWithComponents.components.forEach((component) => {
      uniqueComponents[component._id] = component.name;
    });
    const componentsToSet = [];
    Object.keys(uniqueComponents).forEach((key) => {
      componentsToSet.push({ label: uniqueComponents[key], value: key });
    });
    componentsToSet.sort((a, b) => ((a.label > b.label) ? 1 : -1));
    setComponents(componentsToSet);
    setSelectedComponents([]);
  };

  useEffect(() => {
    resetEnvironmentsForTableFilter(availableEnvironments);
    resetComponentsForTableFilter(team);
  }, []);

  useEffect(() => {
    resetEnvironmentsForTableFilter(availableEnvironments);
  }, [availableEnvironments]);

  useEffect(() => {
    resetComponentsForTableFilter(team);
  }, [team]);

  const isRowSelected = (build) => selectedBuilds[build._id];

  const anyRowsSelected = () => {
    const selectedRowsArray = retrieveSelectedBuilds();
    return (Object.keys(selectedRowsArray).length > 0);
  };

  const getComponentName = (build) => build.team.components
    .find((component) => component._id === build.component);

  const settingSelectedEnvironments = (environmentToSelect) => {
    setSelectedEnvironments(environmentToSelect);
    setFilteredEnvironments(environmentToSelect.map((environment) => environment.value));
  };

  const settingSelectedComponents = (componentsToSelect) => {
    setSelectedComponents(componentsToSelect);
    setFilteredComponents(componentsToSelect.map((component) => component.value));
  };

  const getPercentageString = (resultState, result) => {
    let total = 0;
    Object.keys(result).forEach((key) => {
      total += result[key];
    });
    return Math.round(((result[resultState] / total) * 100));
  };

  const generateResultBar = (result) => (
    <ProgressBar style={{ height: '2em' }}>
      <ProgressBar label={`${getPercentageString('PASS', result)}%`} variant="success" now={getPercentageString('PASS', result)} key={1} />
      <ProgressBar label={`${getPercentageString('SKIPPED', result)}%`} variant="info" now={getPercentageString('SKIPPED', result)} key={2} />
      <ProgressBar label={`${getPercentageString('ERROR', result)}%`} variant="warning" now={getPercentageString('ERROR', result)} key={3} />
      <ProgressBar label={`${getPercentageString('FAIL', result)}%`} variant="danger" now={getPercentageString('FAIL', result)} key={4} />
    </ProgressBar>
  );

  const generateBuildRows = () => {
    const {
      builds,
      toggleSelectedBuild,
      currentSkip,
    } = props;
    const buildRows = [];
    let count = 0;
    builds.forEach((build) => {
      count += 1;
      const popover = (
        <Popover id="popover-basic">
          <Popover.Header as="h3">
            <b>Artifacts</b>
          </Popover.Header>
          <Popover.Body>
            <ArtifactsDetailsTable artifacts={build.artifacts} />
          </Popover.Body>
        </Popover>
      );
      buildRows.push(
        <tr key={build._id}>
          <th scope="row">{currentSkip + count}</th>
          <td onClick={() => toggleSelectedBuild(build)}>
            <div key={isRowSelected(build)}>
              <i className={isRowSelected(build) ? ('far fa-check-square') : 'far fa-square'} />
            </div>
          </td>
          <td className="build-details">
            <FlexboxGrid justify="start">
              <FlexboxGrid.Item colspan={2}>
                {
                  build.keep ? (
                    <i className="fas fa-lock" />
                  ) : null
                }
              </FlexboxGrid.Item>
              <FlexboxGrid.Item colspan={18}>
                <div>
                  <a href={`/build/?buildId=${build._id}`} target="_self">
                    {build.name}
                  </a>
                </div>
                <div>
                  {
                    build.phase ? (
                      <span>{build.phase.name}</span>
                    ) : 'none'
                  }
                </div>
              </FlexboxGrid.Item>
              <FlexboxGrid.Item colspan={4}>
                <OverlayTrigger trigger="click" rootClose placement="right" overlay={popover}>
                  <Badge content={build.artifacts.length}>
                    <TreeIcon style={{ fontSize: '1.5em' }} />
                  </Badge>
                </OverlayTrigger>
              </FlexboxGrid.Item>
            </FlexboxGrid>
          </td>
          <td>
            {build.start ? (
              <div>
                <div>
                  <span>
                    <Moment format="DD MMM">
                      {build.start}
                    </Moment>
                  </span>
                  <span> </span>
                  <Moment format="HH:mm">
                    {build.start}
                  </Moment>
                </div>
                { build.end ? (
                  <div>
                    <span>
                      <TimeIcon />
                      { getDuration(build)}
                    </span>
                  </div>
                ) : null}
              </div>
            ) : 'N/A'}
          </td>
          <td>{getComponentName(build).name}</td>
          <td>{build.environment.name}</td>
          <td>
            <div>
              { generateResultBar(build.result) }
            </div>
          </td>
        </tr>,
      );
    });
    return buildRows;
  };

  return (
    <div>
      <table className="table table-hover summary-table">
        <thead className="thead-dark">
          <tr>
            <th scope="col">#</th>
            <th scope="col">
              <div key={anyRowsSelected()}>
                <i className={anyRowsSelected() ? ('fas fa-check-square') : 'fas fa-square'} />
              </div>
            </th>
            <th scope="col">Build Details</th>
            <th scope="col">Date/Time</th>
            <th scope="col">
              <MultiSelect
                className="build-table-filter"
                options={components}
                value={selectedComponents}
                onChange={settingSelectedComponents}
                overrideStrings={componentOverrideStrings}
                hasSelectAll={false}
              />
            </th>
            <th scope="col">
              <MultiSelect
                className="build-table-filter"
                options={environments}
                value={selectedEnvironments}
                onChange={settingSelectedEnvironments}
                labelledBy="Environment"
                overrideStrings={environmentOverrideStrings}
                hasSelectAll={false}
              />
            </th>

            <th scope="col">Result</th>
          </tr>
        </thead>
        <tbody>
          {generateBuildRows()}
        </tbody>
      </table>
    </div>
  );
};

export default BuildsTable;
