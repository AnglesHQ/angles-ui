import React, { useMemo, useState } from 'react';
import Moment from 'react-moment';
import { FormattedMessage, useIntl } from 'react-intl';
import HistoryIcon from '@rsuite/icons/History';
import ArrowDownLineIcon from '@rsuite/icons/ArrowDownLine';
import ArrowRightLineIcon from '@rsuite/icons/ArrowRightLine';
import CheckIcon from '@rsuite/icons/Check';
import CloseIcon from '@rsuite/icons/Close';
import MinusIcon from '@rsuite/icons/Minus';
import RemindFillIcon from '@rsuite/icons/RemindFill';
import InfoOutlineIcon from '@rsuite/icons/InfoOutline';
import {
  Table,
  Panel,
  Popover,
  Whisper,
  CheckPicker,
} from 'rsuite';
import TestDetailsTable from './TestDetailsTable';

const { Column, HeaderCell, Cell } = Table;

const KNOWN_STATUSES = ['PASS', 'FAIL', 'ERROR', 'SKIPPED'];
const MANY_RUNS_THRESHOLD = 10;
const RUN_COLUMN_WIDTH = 110;

const statusTextClass = (status) => (KNOWN_STATUSES.includes(status) ? `status-${status.toLowerCase()}` : 'status-info');

const statusIcon = (status) => {
  if (status === 'PASS') {
    return <CheckIcon />;
  }
  if (status === 'FAIL') {
    return <CloseIcon />;
  }
  if (status === 'ERROR') {
    return <RemindFillIcon />;
  }
  if (status === 'SKIPPED') {
    return <MinusIcon />;
  }
  return <InfoOutlineIcon />;
};

const testDetailsSpeaker = (execution, hasMultipleExecutions, intl) => (
  <Popover title={intl.formatMessage({ id: 'page.test-run-compare.popover.details-title' })} className="compare-details-popover">
    {
      hasMultipleExecutions ? (
        <div className="form-warning-text">
          <FormattedMessage id="page.test-run-compare.cell.multiple-executions" />
        </div>
      ) : null
    }
    <TestDetailsTable execution={execution} />
  </Popover>
);

const runHeaderSpeaker = (build) => (
  <Popover className="compare-run-popover">
    <div className="compare-run-popover-name">{build.name}</div>
    <div>
      <FormattedMessage id="page.test-run-compare.detail.start-date" />
      {': '}
      <Moment utc format="DD-MM-YYYY HH:mm">{build.start}</Moment>
    </div>
    <div>
      <FormattedMessage id="page.test-run-compare.detail.environment" />
      {': '}
      {build.environment ? build.environment.name : '-'}
    </div>
  </Popover>
);

// Column header carrying the run's identity (name + start date) plus, on the
// results matrix, its pass/total summary — so a horizontally scrolled column
// is never anonymous.
const RunColumnHeader = function (props) {
  const { build, summary } = props;
  const intl = useIntl();
  return (
    <Whisper placement="bottomEnd" trigger="hover" enterable speaker={runHeaderSpeaker(build)}>
      <div className="compare-run-header">
        <a className="compare-run-header-name" href={`/test-run/?buildId=${build._id}`} target="_self">
          {build.name}
        </a>
        <span className="compare-run-header-date">
          <Moment utc format="DD-MM HH:mm">{build.start}</Moment>
        </span>
        {
          summary ? (
            <span
              className="compare-run-header-counts"
              title={intl.formatMessage({ id: 'page.test-run-compare.header.run-summary' }, {
                passed: summary.pass,
                total: summary.total,
                failed: summary.fail,
                errors: summary.error,
              })}
            >
              <span className="compare-run-header-counts-total">{summary.pass}/{summary.total}</span>
              {summary.fail > 0 ? <span className="compare-run-count-pill status-bg-fail">{summary.fail}</span> : null}
              {summary.error > 0 ? <span className="compare-run-count-pill status-bg-error">{summary.error}</span> : null}
            </span>
          ) : null
        }
      </div>
    </Whisper>
  );
};

const NumberCell = function (props) {
  const { rowData: row } = props;
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <Cell {... props}>
      {row.type === 'test' ? row.number : null}
    </Cell>
  );
};

// Fixed identity column: suite header rows render the collapse toggle +
// rollup; test rows render the test name + history link.
const TestNameCell = function (props) {
  const {
    collapsedSuites, onToggleSuite, artifactsCollapsed, onToggleArtifacts, ...cellProps
  } = props;
  const { rowData: row } = cellProps;
  const intl = useIntl();
  if (row.type === 'artifact-section') {
    return (
      // eslint-disable-next-line react/jsx-props-no-spreading
      <Cell {... cellProps}>
        <button
          type="button"
          className="compare-suite-toggle"
          aria-expanded={!artifactsCollapsed}
          onClick={onToggleArtifacts}
        >
          {artifactsCollapsed ? <ArrowRightLineIcon /> : <ArrowDownLineIcon />}
          <span className="compare-suite-name">
            <FormattedMessage id="page.test-run-compare.section.artifacts" />
          </span>
          <span className="compare-suite-count">
            <FormattedMessage id="page.test-run-compare.artifacts.count" values={{ count: row.artifactCount }} />
          </span>
        </button>
      </Cell>
    );
  }
  if (row.type === 'artifact') {
    return (
      // eslint-disable-next-line react/jsx-props-no-spreading
      <Cell {... cellProps}>
        {row.groupId && row.groupId !== '-' ? `${row.groupId}.${row.artifactId}` : row.artifactId}
      </Cell>
    );
  }
  if (row.type === 'suite') {
    const collapsed = collapsedSuites[row.suiteName] === true;
    return (
      // eslint-disable-next-line react/jsx-props-no-spreading
      <Cell {... cellProps}>
        <button
          type="button"
          className="compare-suite-toggle"
          aria-expanded={!collapsed}
          onClick={() => onToggleSuite(row.suiteName)}
        >
          {collapsed ? <ArrowRightLineIcon /> : <ArrowDownLineIcon />}
          <span className="compare-suite-name">{row.suiteName}</span>
          <span className="compare-suite-count">
            <FormattedMessage id="page.test-run-compare.suite.tests" values={{ count: row.testCount }} />
          </span>
        </button>
      </Cell>
    );
  }
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <Cell {... cellProps}>
      {row.testName}
      <span className="execution-compare-icon">
        <a className="test-history-link" title={intl.formatMessage({ id: 'page.test-run-compare.link.execution-history' }, { testName: row.testName })} href={`/test-execution-history?executionId=${row.executionIdForHistory}`}>
          <HistoryIcon />
        </a>
      </span>
    </Cell>
  );
};

// One run column of the results matrix: a compact status chip per test (click
// for the details popover), a pass/total rollup on suite header rows, and a
// muted dash when the test did not run.
const ResultCell = function (props) {
  const { build, ...cellProps } = props;
  const { rowData: row } = cellProps;
  const intl = useIntl();
  if (row.type === 'artifact-section') {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <Cell {... cellProps} />;
  }
  if (row.type === 'artifact') {
    const version = row[build._id];
    if (!version) {
      return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <Cell {... cellProps}>
          <span className="compare-cell-missing" title={intl.formatMessage({ id: 'page.test-run-compare.cell.not-available' })}>–</span>
        </Cell>
      );
    }
    const versionChanged = row.changed[build._id] === true;
    return (
      // eslint-disable-next-line react/jsx-props-no-spreading
      <Cell {... cellProps}>
        <span
          className={versionChanged ? 'compare-version-changed' : undefined}
          title={versionChanged ? intl.formatMessage({ id: 'page.test-run-compare.cell.status-changed' }) : undefined}
        >
          {version}
        </span>
      </Cell>
    );
  }
  if (row.type === 'suite') {
    const rollup = row.rollups[build._id];
    if (!rollup || rollup.total === 0) {
      return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <Cell {... cellProps}>
          <span className="compare-cell-missing" title={intl.formatMessage({ id: 'page.test-run-compare.cell.not-available' })}>–</span>
        </Cell>
      );
    }
    let rollupClass = 'status-info';
    if (rollup.fail > 0) {
      rollupClass = 'status-fail';
    } else if (rollup.error > 0) {
      rollupClass = 'status-error';
    } else if (rollup.pass === rollup.total) {
      rollupClass = 'status-pass';
    }
    return (
      // eslint-disable-next-line react/jsx-props-no-spreading
      <Cell {... cellProps}>
        <span
          className={`compare-suite-rollup ${rollupClass}`}
          title={intl.formatMessage({ id: 'page.test-run-compare.suite.rollup' }, { passed: rollup.pass, total: rollup.total })}
        >
          {rollup.pass}/{rollup.total}
        </span>
      </Cell>
    );
  }
  const execution = row[build._id];
  if (!execution) {
    return (
      // eslint-disable-next-line react/jsx-props-no-spreading
      <Cell {... cellProps}>
        <span className="compare-cell-missing" title={intl.formatMessage({ id: 'page.test-run-compare.cell.not-available' })}>–</span>
      </Cell>
    );
  }
  const changed = row.changed[build._id] === true;
  const hasMultipleExecutions = row.multipleExecutions[build._id] === true;
  const chipTitleParts = [execution.status];
  if (changed) {
    chipTitleParts.push(intl.formatMessage({ id: 'page.test-run-compare.cell.status-changed' }));
  }
  if (hasMultipleExecutions) {
    chipTitleParts.push(intl.formatMessage({ id: 'page.test-run-compare.cell.multiple-executions' }));
  }
  const chipTitle = chipTitleParts.join(' · ');
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <Cell {... cellProps}>
      <Whisper
        placement="leftStart"
        trigger="click"
        speaker={testDetailsSpeaker(execution, hasMultipleExecutions, intl)}
      >
        <button
          type="button"
          className={`compare-chip ${statusTextClass(execution.status)}${changed ? ' compare-chip-changed' : ''}${hasMultipleExecutions ? ' compare-chip-multi' : ''}`}
          title={chipTitle}
          aria-label={chipTitle}
        >
          {statusIcon(execution.status)}
        </button>
      </Whisper>
    </Cell>
  );
};

const TestRunCompareTable = function (props) {
  const { testRunCompareBuilds } = props;
  const intl = useIntl();
  const [statusFilter, setStatusFilter] = useState([]);
  const [collapsedSuites, setCollapsedSuites] = useState({});
  const [artifactsCollapsed, setArtifactsCollapsed] = useState(false);

  // Chronological order (oldest → newest) so the matrix reads as a timeline,
  // regardless of the buildIds order in the url.
  const builds = useMemo(
    () => [...testRunCompareBuilds].sort((a, b) => new Date(a.start) - new Date(b.start)),
    [testRunCompareBuilds],
  );

  const matrix = useMemo(() => {
    const suiteMap = {};
    builds.forEach((build) => {
      (build.suites || []).forEach((suite) => {
        (suite.executions || []).forEach((execution) => {
          const { title, suite: suiteName } = execution;
          if (!suiteMap[suiteName]) {
            suiteMap[suiteName] = {};
          }
          if (!suiteMap[suiteName][title]) {
            suiteMap[suiteName][title] = {};
          }
          if (!suiteMap[suiteName][title][execution.build]) {
            suiteMap[suiteName][title][execution.build] = { executions: [] };
          }
          suiteMap[suiteName][title][execution.build].executions.push(execution);
        });
      });
    });

    const summaries = {};
    builds.forEach((build) => {
      summaries[build._id] = {
        pass: 0, fail: 0, error: 0, total: 0,
      };
    });
    const suites = [];
    Object.keys(suiteMap).forEach((suiteName) => {
      const rollups = {};
      builds.forEach((build) => {
        rollups[build._id] = {
          pass: 0, fail: 0, error: 0, total: 0,
        };
      });
      const rows = [];
      Object.keys(suiteMap[suiteName]).forEach((testName) => {
        const row = {
          type: 'test',
          suiteName,
          testName,
          multipleExecutions: {},
          changed: {},
        };
        let previousStatus = null;
        builds.forEach((build) => {
          const cell = suiteMap[suiteName][testName][build._id];
          if (!cell) {
            return;
          }
          [row[build._id]] = cell.executions;
          if (!row.executionIdForHistory) {
            row.executionIdForHistory = cell.executions[0]._id;
          }
          if (cell.executions.length > 1) {
            // warning marker: suite + test name combinations should be unique
            // within a run.
            row.multipleExecutions[build._id] = true;
          }
          const { status } = cell.executions[0];
          if (previousStatus !== null && status !== previousStatus) {
            row.changed[build._id] = true;
          }
          previousStatus = status;
          const rollup = rollups[build._id];
          const summary = summaries[build._id];
          rollup.total += 1;
          summary.total += 1;
          if (status === 'PASS') {
            rollup.pass += 1;
            summary.pass += 1;
          } else if (status === 'FAIL') {
            rollup.fail += 1;
            summary.fail += 1;
          } else if (status === 'ERROR') {
            rollup.error += 1;
            summary.error += 1;
          }
        });
        rows.push(row);
      });
      suites.push({ suiteName, rollups, rows });
    });
    return { suites, summaries };
  }, [builds]);

  const statusOptions = useMemo(() => {
    const statuses = new Set();
    matrix.suites.forEach((suite) => {
      suite.rows.forEach((row) => {
        builds.forEach((build) => {
          if (row[build._id]) {
            statuses.add(row[build._id].status);
          }
        });
      });
    });
    return [...statuses].sort().map((status) => ({
      value: status,
      label: KNOWN_STATUSES.includes(status)
        ? intl.formatMessage({ id: `app.result.${status.toLowerCase()}` })
        : status,
    }));
  }, [matrix, builds, intl]);

  // Artifact versions of the system under test, shown as their own section at
  // the top of the results matrix. Versions that differ from the previous run
  // are flagged so version bumps line up visually with result changes.
  const artifactRows = useMemo(() => {
    const artifactCompare = {};
    builds.forEach((build) => {
      (build.artifacts || []).forEach((artifact) => {
        const artifactIdentifier = `${(artifact.groupId ? `${artifact.groupId}.` : '')}${artifact.artifactId}`;
        if (!artifactCompare[artifactIdentifier]) {
          const { groupId, artifactId } = artifact;
          artifactCompare[artifactIdentifier] = {
            type: 'artifact',
            groupId: groupId || '-',
            artifactId,
            changed: {},
          };
        }
        artifactCompare[artifactIdentifier][build._id] = artifact.version;
      });
    });
    return Object.keys(artifactCompare).map((artifactIdentifier) => {
      const artifactDetails = artifactCompare[artifactIdentifier];
      let previousVersion = null;
      builds.forEach((build) => {
        const version = artifactDetails[build._id];
        if (!version) {
          return;
        }
        if (previousVersion !== null && version !== previousVersion) {
          artifactDetails.changed[build._id] = true;
        }
        previousVersion = version;
      });
      return artifactDetails;
    });
  }, [builds]);

  const tableData = useMemo(() => {
    const rowMatchesFilters = (row) => {
      if (statusFilter.length > 0) {
        return builds.some((build) => row[build._id]
          && statusFilter.includes(row[build._id].status));
      }
      return true;
    };
    const data = [];
    let number = 0;
    if (artifactRows.length > 0) {
      data.push({ type: 'artifact-section', artifactCount: artifactRows.length });
      if (!artifactsCollapsed) {
        data.push(...artifactRows);
      }
    }
    matrix.suites.forEach((suite) => {
      const visibleRows = suite.rows.filter(rowMatchesFilters);
      if (visibleRows.length === 0) {
        return;
      }
      data.push({
        type: 'suite',
        suiteName: suite.suiteName,
        rollups: suite.rollups,
        testCount: visibleRows.length,
      });
      if (collapsedSuites[suite.suiteName] !== true) {
        visibleRows.forEach((row) => {
          number += 1;
          data.push({ ...row, number });
        });
      }
    });
    return data;
  }, [matrix, builds, artifactRows, artifactsCollapsed, statusFilter, collapsedSuites]);

  const onToggleSuite = (suiteName) => {
    setCollapsedSuites((current) => ({ ...current, [suiteName]: current[suiteName] !== true }));
  };

  const onToggleArtifacts = () => {
    setArtifactsCollapsed((current) => !current);
  };

  return (
    <div>
      {
        builds.length > MANY_RUNS_THRESHOLD ? (
          <div className="app-alert app-alert-info" role="alert">
            <FormattedMessage id="page.test-run-compare.warning.many-runs" values={{ count: builds.length }} />
          </div>
        ) : null
      }
      <Panel className="test-run-compare-panel">
        <div className="page-section-title">
          <FormattedMessage id="page.test-run-compare.section.compare-matrix" />
        </div>
        <div className="page-toolbar compare-toolbar">
          <CheckPicker
            className="compare-status-filter"
            data={statusOptions}
            value={statusFilter}
            onChange={(value) => setStatusFilter(value || [])}
            searchable={false}
            placeholder={intl.formatMessage({ id: 'page.test-run-compare.toolbar.status-filter' })}
          />
        </div>
        <Table
          data={tableData}
          className="test-run-compare-table test-run-compare-matrix"
          autoHeight
          wordWrap="break-word"
          headerHeight={84}
          hover={false}
          affixHeader
          affixHorizontalScrollbar
          rowClassName={(rowData) => (rowData && (rowData.type === 'suite' || rowData.type === 'artifact-section') ? 'compare-suite-row' : '')}
        >
          <Column width={44} fixed>
            <HeaderCell><FormattedMessage id="page.test-run-compare.header.number" /></HeaderCell>
            <NumberCell />
          </Column>
          <Column width={320} fixed>
            <HeaderCell><FormattedMessage id="page.test-run-compare.header.test-name" /></HeaderCell>
            <TestNameCell
              collapsedSuites={collapsedSuites}
              onToggleSuite={onToggleSuite}
              artifactsCollapsed={artifactsCollapsed}
              onToggleArtifacts={onToggleArtifacts}
            />
          </Column>
          {
            builds.map((build) => (
              <Column width={RUN_COLUMN_WIDTH} key={build._id} align="center">
                <HeaderCell>
                  <RunColumnHeader build={build} summary={matrix.summaries[build._id]} />
                </HeaderCell>
                <ResultCell build={build} />
              </Column>
            ))
          }
        </Table>
      </Panel>
    </div>
  );
};

export default TestRunCompareTable;
