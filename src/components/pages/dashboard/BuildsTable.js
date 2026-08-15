import React from 'react';
import Moment from 'react-moment';
import { FormattedMessage, useIntl } from 'react-intl';
import TimeIcon from '@rsuite/icons/Time';
import TreeIcon from '@rsuite/icons/Tree';
import { BsFillUnlockFill, BsLockFill } from 'react-icons/bs';
import {
  Badge,
  Checkbox,
  Table,
  Popover,
  Tooltip,
  Whisper,
} from 'rsuite';
import { getDuration } from '../../../utility/TimeUtilities';
import ExecutionsResultsBar from '../../features/results-bar';
import BuildArtifacts from '../../common/BuildArtifacts';

const { Column, HeaderCell, Cell } = Table;

const artifactsSpeaker = (build) => (
  <Popover
    title={<FormattedMessage id="page.dashboard.builds-table.artifacts.title" />}
    style={{ width: '350px' }}
  >
    <BuildArtifacts build={build} />
  </Popover>
);

/*
  Status pill — the headline fact for a row. Uses the shared `.status-bg-*`
  fills so the colour matches the results bar and the test-run page.
*/
// Statuses that have both a `.status-bg-*` fill and an `app.result.*` label.
const KNOWN_STATUSES = ['pass', 'fail', 'error', 'skipped'];

const StatusCell = function (props) {
  const { rowData: build } = props;
  const status = build.status ? build.status.toLowerCase() : undefined;
  if (!status) {
    return (
      // eslint-disable-next-line react/jsx-props-no-spreading
      <Cell {...props}>
        <span className="builds-table-empty">
          <FormattedMessage id="page.dashboard.builds-table.not-available" />
        </span>
      </Cell>
    );
  }
  // An unrecognised status still gets a pill, but shows the raw value in the
  // neutral fill rather than resolving a translation id that does not exist.
  const isKnown = KNOWN_STATUSES.includes(status);
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <Cell {...props}>
      <span
        className={`builds-table-status-pill ${isKnown ? `status-bg-${status}` : 'builds-table-status-pill-unknown'}`}
      >
        {
          isKnown ? <FormattedMessage id={`app.result.${status}`} /> : build.status
        }
      </span>
    </Cell>
  );
};

/*
  Build identity — name (link) over the secondary facts that qualify it:
  component, environment and phase. Grouping them here frees the two columns
  they used to occupy and keeps "what ran, and where" in one scannable block.
*/
const BuildDetailsCell = function (props) {
  const { rowData: build, getComponentName, ...rest } = props;
  const componentName = getComponentName(build);
  const environmentName = build.environment ? build.environment.name : undefined;
  const phaseName = build.phase ? build.phase.name : undefined;
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <Cell {...rest}>
      <div className="builds-table-details">
        <a
          className="builds-table-build-name"
          href={`/test-run/?buildId=${build._id}`}
          target="_self"
          title={build.name}
        >
          {build.name}
        </a>
        <div className="builds-table-meta">
          {
            componentName ? (
              <span className="builds-table-meta-item" title={componentName}>
                {componentName}
              </span>
            ) : null
          }
          {
            environmentName ? (
              <span className="builds-table-meta-item" title={environmentName}>
                {environmentName}
              </span>
            ) : null
          }
          {
            phaseName ? (
              <span className="builds-table-meta-item" title={phaseName}>
                {phaseName}
              </span>
            ) : null
          }
        </div>
      </div>
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
      <Checkbox
        key={`${build._id}-${isRowSelected(build)}`}
        value={build._id}
        onClick={() => toggleSelectedBuild(build)}
        checked={isRowSelected(build)}
        inline={false}
      />
    </Cell>
  );
};

const DateCell = function (props) {
  const { rowData: build } = props;
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <Cell {...props}>
      { build.start ? (
        <div>
          <div>
            <Moment utc format="DD MMM">
              {build.start}
            </Moment>
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
                { getDuration(build) }
              </span>
            </div>
          ) : null}
        </div>
      ) : (
        <span className="builds-table-empty">
          <FormattedMessage id="page.dashboard.builds-table.not-available" />
        </span>
      )}
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

/*
  Row-level flags: the keep lock and the artifacts badge. Both are optional
  markers rather than data, so they sit together in a narrow trailing column
  instead of competing with the build name for space.
*/
const FlagsCell = function (props) {
  const { rowData: build, intl, ...rest } = props;
  const artifactCount = build.artifacts ? build.artifacts.length : 0;
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <Cell {...rest} className="builds-table-flags-cell">
      <Whisper
        placement="left"
        trigger="hover"
        speaker={(
          <Tooltip>
            <FormattedMessage
              id={build.keep
                ? 'page.dashboard.builds-table.keep.enabled'
                : 'page.dashboard.builds-table.keep.disabled'}
            />
          </Tooltip>
        )}
      >
        <span className="builds-table-flag">
          {
            build.keep
              ? <BsLockFill className="test-run-lock-icon" />
              : <BsFillUnlockFill className="test-run-unlock-icon" />
          }
        </span>
      </Whisper>
      {
        artifactCount > 0 ? (
          <Whisper
            placement="left"
            trigger="hover"
            speaker={artifactsSpeaker(build)}
          >
            <span
              className="builds-table-flag"
              aria-label={intl.formatMessage(
                { id: 'page.dashboard.builds-table.artifacts.count' },
                { count: artifactCount },
              )}
            >
              <Badge content={artifactCount}>
                <TreeIcon />
              </Badge>
            </span>
          </Whisper>
        ) : null
      }
    </Cell>
  );
};

const BuildsTable = function (props) {
  const {
    builds,
    selectedBuilds,
    retrieveSelectedBuilds,
    toggleSelectedBuild,
    toggleAllSelectedBuilds,
  } = props;
  const intl = useIntl();

  const isRowSelected = (build) => selectedBuilds[build._id];

  const anyRowsSelected = () => {
    const selectedRowsArray = retrieveSelectedBuilds();
    return (Object.keys(selectedRowsArray).length > 0);
  };

  const allRowsSelected = () => builds.length > 0
    && builds.every((build) => isRowSelected(build));

  const someRowsSelected = () => anyRowsSelected() && !allRowsSelected();

  // `component` is an id on the build; resolve it against the team's component
  // list, which may not contain it if the component was removed from the team.
  const getComponentName = (build) => {
    const component = build.team && Array.isArray(build.team.components)
      ? build.team.components.find((current) => current._id === build.component)
      : undefined;
    return component ? component.name : undefined;
  };

  return (
    <div>
      <Table
        affixHeader
        autoHeight
        rowHeight={64}
        headerHeight={40}
        data={builds}
        hover
        id="builds-table"
        className="dashboard-builds-table"
      >
        <Column width={50} align="center" fixed>
          <HeaderCell>
            <Checkbox
              className="builds-table-header-checkbox"
              checked={allRowsSelected()}
              indeterminate={someRowsSelected()}
              onChange={() => toggleAllSelectedBuilds()}
              inline
            />
          </HeaderCell>
          <CheckCell isRowSelected={isRowSelected} toggleSelectedBuild={toggleSelectedBuild} />
        </Column>
        <Column width={110}>
          <HeaderCell>
            <FormattedMessage
              id="page.dashboard.builds-table.header.status"
            />
          </HeaderCell>
          <StatusCell />
        </Column>
        <Column flexGrow={4} minWidth={220}>
          <HeaderCell>
            <FormattedMessage
              id="page.dashboard.builds-table.header.build-details"
            />
          </HeaderCell>
          <BuildDetailsCell getComponentName={getComponentName} />
        </Column>
        <Column flexGrow={2} minWidth={130}>
          <HeaderCell>
            <FormattedMessage
              id="page.dashboard.builds-table.header.date-time"
            />
          </HeaderCell>
          <DateCell />
        </Column>
        <Column flexGrow={3} minWidth={180}>
          <HeaderCell>
            <FormattedMessage
              id="page.dashboard.builds-table.header.result"
            />
          </HeaderCell>
          <ResultCell />
        </Column>
        <Column width={90} align="center">
          <HeaderCell>
            <FormattedMessage
              id="page.dashboard.builds-table.header.flags"
            />
          </HeaderCell>
          <FlagsCell intl={intl} />
        </Column>
      </Table>
    </div>
  );
};

export default BuildsTable;
