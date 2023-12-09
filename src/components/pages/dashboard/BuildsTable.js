import React from 'react';
import Moment from 'react-moment';
import { FormattedMessage } from 'react-intl';
import TimeIcon from '@rsuite/icons/Time';
import TreeIcon from '@rsuite/icons/Tree';
import { BsFillUnlockFill, BsLockFill } from 'react-icons/bs';
import {
  Badge,
  FlexboxGrid,
  Checkbox,
  Table,
  Popover,
  Whisper,
  CheckboxGroup,
} from 'rsuite';
import { getDuration } from '../../../utility/TimeUtilities';
import ExecutionsResultsBar from '../../common/results-bar';
import BuildArtifacts from '../../common/BuildArtifacts';

const { Column, HeaderCell, Cell } = Table;

const componentDetailsSpeaker = (build) => (
  <Popover title="Artifacts" style={{ width: '350px' }}>
    <BuildArtifacts build={build} />
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
            build.keep ? <BsLockFill className="tests-runs-lock-icon" /> : <BsFillUnlockFill className="tests-runs-unlock-icon" />
          }
        </FlexboxGrid.Item>
        <FlexboxGrid.Item colspan={16}>
          <div>
            <a href={`/test-run/?buildId=${build._id}`} target="_self">
              {build.name}
            </a>
          </div>
          <div className="dashboard-builds-table-sub-text">
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
  const {
    rowData: build,
    toggleSelectedBuild,
    isRowSelected,
    ...rest
  } = props;
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <Cell {...rest}>
      <CheckboxGroup>
        <Checkbox
          key={`${build._id}-${isRowSelected(build)}`}
          value={build._id}
          onClick={() => toggleSelectedBuild(build)}
          checked={isRowSelected(build)}
          inline={false}
        />
      </CheckboxGroup>
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
              <Moment utc format="DD MMM">
                {build.start}
              </Moment>
            </span>
            <span> </span>
            <Moment utc format="HH:mm">
              {build.start}
            </Moment>
          </div>
          { build.end ? (
            <div className="dashboard-builds-table-sub-text">
              <span className="dashboard-builds-table-date-icon">
                <TimeIcon />
              </span>
              <span>
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
  const { rowData: build } = props;
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <Cell {...props} className="builds-table-result-cell">
      <ExecutionsResultsBar result={build.result} />
    </Cell>
  );
};

const BuildsTable = function (props) {
  const {
    builds,
    selectedBuilds,
    retrieveSelectedBuilds,
    toggleSelectedBuild,
  } = props;

  const isRowSelected = (build) => selectedBuilds[build._id];

  const anyRowsSelected = () => {
    const selectedRowsArray = retrieveSelectedBuilds();
    return (Object.keys(selectedRowsArray).length > 0);
  };

  const getComponentName = (build) => build.team.components
    .find((component) => component._id === build.component);

  return (
    <div>
      <Table
        affixHeader
        rowHeight={65}
        headerHeight={40}
        height={500}
        data={builds}
        hover={false}
        id="builds-table"
        className="dashboard-builds-table"
      >
        <Column width={50} align="center">
          <HeaderCell>#</HeaderCell>
          <Cell dataKey="index" />
        </Column>
        <Column width={50}>
          <HeaderCell>
            <Checkbox className="build-table-header-checkbox" checked={anyRowsSelected()} inline />
          </HeaderCell>
          <CheckCell isRowSelected={isRowSelected} toggleSelectedBuild={toggleSelectedBuild} />
        </Column>
        <Column flexGrow={4}>
          <HeaderCell>
            <FormattedMessage
              id="page.dashboard.builds-table.header.build-details"
            />
          </HeaderCell>
          <BuildDetailsCell />
        </Column>
        <Column flexGrow={2}>
          <HeaderCell>
            <FormattedMessage
              id="page.dashboard.builds-table.header.date-time"
            />
          </HeaderCell>
          <DateCell />
        </Column>
        <Column flexGrow={2}>
          <HeaderCell>
            <FormattedMessage
              id="page.dashboard.builds-table.header.component"
            />
          </HeaderCell>
          <Cell>
            {
              (rowData) => getComponentName(rowData).name
            }
          </Cell>
        </Column>
        <Column flexGrow={2}>
          <HeaderCell>
            <FormattedMessage
              id="page.dashboard.builds-table.header.environment"
            />
          </HeaderCell>
          <Cell dataKey="environment.name" />
        </Column>
        <Column flexGrow={3}>
          <HeaderCell>
            <FormattedMessage
              id="page.dashboard.builds-table.header.result"
            />
          </HeaderCell>
          <ResultCell />
        </Column>
      </Table>
    </div>
  );
};

export default BuildsTable;
