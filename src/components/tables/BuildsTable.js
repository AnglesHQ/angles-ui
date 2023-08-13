import React, { useEffect, useState } from 'react';
import Moment from 'react-moment';
// import { TagPicker } from 'rsuite';
import ProgressBar from 'react-bootstrap/ProgressBar';
import TimeIcon from '@rsuite/icons/Time';
import TreeIcon from '@rsuite/icons/Tree';
import FunnelIcon from '@rsuite/icons/Funnel';
import TagLockIcon from '@rsuite/icons/TagLock';
import {
  Badge,
  FlexboxGrid,
  Checkbox,
  Table,
  Popover,
  Whisper,
  MultiCascader,
} from 'rsuite';
import { getDuration } from '../../utility/TimeUtilities';
import ArtifactsDetailsTable from './ArtifactsDetailsTable';

const { Column, HeaderCell, Cell } = Table;

const componentDetailsSpeaker = (build) => (
  <Popover title="Artifacts">
    <ArtifactsDetailsTable artifacts={build.artifacts} />
  </Popover>
);

const BuildDetailsCell = function (props) {
  const { rowData: build } = props;
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <Cell {... props}>
      <FlexboxGrid justify="start">
        <FlexboxGrid.Item colspan={4}>
          {
            build.keep ? (
              <TagLockIcon style={{ fontSize: '1.5em' }} />
            ) : null
          }
        </FlexboxGrid.Item>
        <FlexboxGrid.Item colspan={16}>
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
          <Whisper placement="right" trigger="hover" controlId="control-id-hover" speaker={componentDetailsSpeaker(build)}>
            <Badge content={build.artifacts.length}>
              <TreeIcon style={{ fontSize: '1.5em' }} />
            </Badge>
          </Whisper>
        </FlexboxGrid.Item>
      </FlexboxGrid>
    </Cell>
  );
};

const CheckCell = function (props) {
  const { rowData: build, toggleSelectedBuild, isRowSelected } = props;
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <Cell {... props}>
      <Checkbox
        value={build._id}
        onClick={() => toggleSelectedBuild(build)}
        checked={isRowSelected(build)}
      />
    </Cell>
  );
};

const DateCell = function (props) {
  const { rowData: build } = props;
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <Cell {... props}>
      { build.start ? (
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
    </Cell>
  );
};

const ResultCell = function (props) {
  const { rowData: build, generateResultBar } = props;
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <Cell {... props}>
      <div>
        { generateResultBar(build.result) }
      </div>
    </Cell>
  );
};

const generateData = function (environments, components) {
  const data = [];
  data.push({
    label: 'Environments',
    value: 1,
    children: environments,
  });
  data.push({
    label: 'Components',
    value: 2,
    children: components,
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
            .includes(component.value)).map((component) => component.value));
          setFilteredEnvironments(environments.filter((environment) => value
            .includes(environment.value)).map((environment) => environment.value));
        }
      }
      value={filteredValues}
    />
  );
};

const BuildsTable = function (props) {
  const [environments, setEnvironments] = useState([]);
  const [components, setComponents] = useState([]);
  const [, setSelectedEnvironments] = useState([]);
  const [, setSelectedComponents] = useState([]);
  const [filteredValues, setFilteredValues] = useState([]);
  const {
    builds,
    team,
    availableEnvironments,
    selectedBuilds,
    retrieveSelectedBuilds,
    setFilteredEnvironments,
    setFilteredComponents,
    toggleSelectedBuild,
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

  return (
    <div>
      <FilterMenu
        data={generateData(environments, components)}
        setFilteredComponents={setFilteredComponents}
        setFilteredEnvironments={setFilteredEnvironments}
        components={components}
        environments={environments}
        filteredValues={filteredValues}
        setFilteredValues={setFilteredValues}
      />
      <Table rowHeight={65} height={300} data={builds} id="table">
        <Column width={50} align="center">
          <HeaderCell style={{ padding: 0 }}>#</HeaderCell>
          <Cell dataKey="index" />
        </Column>
        <Column width={50}>
          <HeaderCell>
            <div key={anyRowsSelected()}>
              <Checkbox checked={anyRowsSelected()} />
            </div>
          </HeaderCell>
          <CheckCell isRowSelected={isRowSelected} toggleSelectedBuild={toggleSelectedBuild} />
        </Column>
        <Column width={250}>
          <HeaderCell>Build Details</HeaderCell>
          <BuildDetailsCell />
        </Column>
        <Column width={150}>
          <HeaderCell>Date/Time</HeaderCell>
          <DateCell />
        </Column>
        <Column width={150}>
          <HeaderCell>Component</HeaderCell>
          <Cell>
            {
              (rowData) => getComponentName(rowData).name
            }
          </Cell>
        </Column>
        <Column width={150}>
          <HeaderCell>Environment</HeaderCell>
          <Cell dataKey="environment.name" />
        </Column>
        <Column width={150}>
          <HeaderCell>
            <span>Result</span>
          </HeaderCell>
          <ResultCell generateResultBar={generateResultBar} />
        </Column>
      </Table>
    </div>
  );
};

export default BuildsTable;
