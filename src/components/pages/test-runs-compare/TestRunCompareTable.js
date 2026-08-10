import React from 'react';
import Moment from 'react-moment';
import { FormattedMessage, useIntl } from 'react-intl';
import HistoryIcon from '@rsuite/icons/History';
import {
  Table,
  Panel,
  Popover,
  Whisper,
} from 'rsuite';
import InfoOutlineIcon from '@rsuite/icons/InfoOutline';
import TestDetailsTable from './TestDetailsTable';

const { Column, HeaderCell, Cell } = Table;

const testDetailsSpeaker = (execution, intl) => (
  <Popover title={intl.formatMessage({ id: 'page.test-run-compare.popover.details-title' })} style={{ width: '500px' }}>
    <TestDetailsTable execution={execution} />
  </Popover>
);

const TestDetailsCell = function (props) {
  const { rowData: test } = props;
  const intl = useIntl();
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <Cell {... props}>
      { test.testName }
      <span className="execution-compare-icon">
        <a className="test-history-link" title={intl.formatMessage({ id: 'page.test-run-compare.link.execution-history' }, { testName: test.testName })} href={`/test-execution-history?executionId=${test.executionIdForHistory}`}>
          <HistoryIcon />
        </a>
      </span>
    </Cell>
  );
};

const TestResultsCell = function (props) {
  const { rowData: test, buildid: buildId } = props;
  const intl = useIntl();
  if (!test[buildId]) {
    return (
      // eslint-disable-next-line react/jsx-props-no-spreading
      <Cell {... props}><FormattedMessage id="page.test-run-compare.cell.not-available" /></Cell>
    );
  }
  let testClass = 'table-info';
  if (test[buildId].status === 'PASS') {
    testClass = 'status-pass';
  } else if (test[buildId].status === 'FAIL') {
    testClass = 'status-fail';
  } else if (test[buildId].status === 'ERROR') {
    testClass = 'status-error';
  }
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <Cell {... props}>
      <span className={testClass}>
        { test[buildId].status}
      </span>
      {
        (test.multipleExecutions[buildId] && test.multipleExecutions[buildId] === true)
          ? (<span> - <FormattedMessage id="page.test-run-compare.cell.multiple-executions" /></span>) : null
      }
      <span className="execution-compare-icon">
        <Whisper
          placement="leftStart"
          trigger="click"
          controlId="control-id-click"
          speaker={testDetailsSpeaker(test[buildId], intl)}
        >
          <span>
            <InfoOutlineIcon />
          </span>
        </Whisper>
      </span>
    </Cell>
  );
};

const TestRunCompareTable = function (props) {
  const { testRunCompareBuilds } = props;
  const intl = useIntl();

  const generateTestRunCompare = () => {
    const suites = testRunCompareBuilds
      .map((testBuild) => testBuild.suites)
      .reduce((a, c) => a.concat(c), []);
    const executions = suites
      .map((testSuite) => testSuite.executions)
      .reduce((a, c) => a.concat(c), []);

    const testRunCompare = {};
    let counter = 0;
    executions.forEach((execution) => {
      const { title, suite } = execution;
      if (!testRunCompare[suite]) {
        testRunCompare[suite] = {};
      }
      if (!testRunCompare[suite][title]) {
        testRunCompare[suite][title] = {};
      }
      if (!testRunCompare[suite][title][execution.build]) {
        testRunCompare[suite][title][execution.build] = {
          executions: [],
        };
      }
      testRunCompare[suite][title][execution.build].executions.push(execution);
    });
    const testRunCompareArray = [];
    Object.keys(testRunCompare).forEach((suiteName) => {
      const suiteRowSpan = Object.keys(testRunCompare[suiteName]).length;
      Object.keys(testRunCompare[suiteName]).forEach((testName, index) => {
        counter += 1;
        let singleRow = {
          id: counter,
          suiteName,
          testName,
          multipleExecutions: {},
        };
        if (index === 0) {
          singleRow = {
            ...singleRow,
            suiteRowSpan,
          };
        }
        Object.keys(testRunCompare[suiteName][testName]).forEach((buildId, buildIndex) => {
          // only assign first test
          [singleRow[buildId]] = testRunCompare[suiteName][testName][buildId].executions;
          if (buildIndex === 0) {
            singleRow.executionIdForHistory = testRunCompare[suiteName][testName][buildId]
              .executions[0]._id;
          }
          if (testRunCompare[suiteName][testName][buildId].executions.length > 1) {
            // to be used for a warning (e.g. for compare suite and test name combination
            // have to be unique).
            singleRow.multipleExecutions[buildId] = true;
          }
        });
        testRunCompareArray.push(singleRow);
      });
    });
    return testRunCompareArray;
  };

  const generateArtifactCompareArray = () => {
    const artifactCompare = {};
    testRunCompareBuilds.forEach((build) => {
      if (build.artifacts && build.artifacts.length > 0) {
        build.artifacts.forEach((artifact) => {
          const artifactIdentifier = `${(artifact.groupId ? `${artifact.groupId}.` : '')}${artifact.artifactId}`;
          if (!artifactCompare[artifactIdentifier]) {
            const { groupId, artifactId } = artifact;
            artifactCompare[artifactIdentifier] = {
              groupId: groupId || '-',
              artifactId,
            };
          }
          artifactCompare[artifactIdentifier][build._id] = artifact.version;
        });
      }
    });
    const artifactCompareArray = [];
    let counter = 0;
    Object.keys(artifactCompare).forEach((artifactIdentifier) => {
      counter += 1;
      const artifactDetails = artifactCompare[artifactIdentifier];
      artifactDetails.id = counter;
      artifactCompareArray.push(artifactDetails);
    });
    return artifactCompareArray;
  };

  const generateBuildDetailsCompare = () => {
    const buildDetailsRows = [];
    const names = {
      id: 1,
      detailName: intl.formatMessage({ id: 'page.test-run-compare.detail.test-run-name' }),
    };
    const startDates = {
      id: 2,
      detailName: intl.formatMessage({ id: 'page.test-run-compare.detail.start-date' }),
    };
    const environments = {
      id: 3,
      detailName: intl.formatMessage({ id: 'page.test-run-compare.detail.environment' }),
    };
    testRunCompareBuilds.forEach((build) => {
      names[build._id] = (
        <a href={`/test-run/?buildId=${build._id}`} target="_self" title={build._id}>
          {build.name}
        </a>
      );
      startDates[build._id] = <Moment utc format="DD-MM-YYYY HH:mm">{build.start}</Moment>;
      environments[build._id] = build.environment.name;
    });
    buildDetailsRows.push(names);
    buildDetailsRows.push(startDates);
    buildDetailsRows.push(environments);
    return buildDetailsRows;
  };

  return (
    <div>
      <Panel className="test-run-compare-panel">
        <Table
          className="test-run-compare-table"
          data={generateBuildDetailsCompare()}
          wordWrap="break-word"
          autoHeight
          headerHeight={40}
          hover={false}
        >
          <Column width={40}>
            <HeaderCell><FormattedMessage id="page.test-run-compare.header.number" /></HeaderCell>
            <Cell
              dataKey="id"
            />
          </Column>
          <Column flexGrow={5}>
            <HeaderCell><FormattedMessage id="page.test-run-compare.header.details" /></HeaderCell>
            <Cell dataKey="detailName" />
          </Column>
          {
            testRunCompareBuilds.map((matrixBuild, index) => (
              <Column width={200} flexGrow={1}>
                <HeaderCell>
                  <div>
                    <FormattedMessage id="page.test-run-compare.header.test-run" values={{ number: index + 1 }} />
                  </div>
                </HeaderCell>
                <Cell dataKey={`${matrixBuild._id}`} />
              </Column>
            ))
          }
        </Table>
        <Table
          className="test-run-compare-table"
          data={generateArtifactCompareArray()}
          wordWrap="break-word"
          autoHeight
          hover={false}
          headerHeight={40}
        >
          <Column width={40}>
            <HeaderCell><FormattedMessage id="page.test-run-compare.header.number" /></HeaderCell>
            <Cell
              dataKey="id"
            />
          </Column>
          <Column
            flexGrow={2}
          >
            <HeaderCell><FormattedMessage id="page.test-run-compare.header.group-id" /></HeaderCell>
            <Cell dataKey="groupId" />
          </Column>
          <Column flexGrow={3}>
            <HeaderCell><FormattedMessage id="page.test-run-compare.header.artifact-id" /></HeaderCell>
            <Cell dataKey="artifactId" />
          </Column>
          {
            testRunCompareBuilds.map((matrixBuild, index) => (
              <Column width={200} flexGrow={1}>
                <HeaderCell>
                  <div>
                    <a href={`/test-run/?buildId=${matrixBuild._id}`} target="_self" title={matrixBuild._id}>
                      <FormattedMessage id="page.test-run-compare.header.test-run" values={{ number: index + 1 }} />
                    </a>
                  </div>
                </HeaderCell>
                <Cell dataKey={`${matrixBuild._id}`} />
              </Column>
            ))
          }
        </Table>
        <Table
          data={generateTestRunCompare()}
          className="test-run-compare-table"
          autoHeight
          wordWrap="break-word"
          headerHeight={40}
          hover={false}
        >
          <Column width={40}>
            <HeaderCell><FormattedMessage id="page.test-run-compare.header.number" /></HeaderCell>
            <Cell
              dataKey="id"
            />
          </Column>
          <Column
            flexGrow={2}
            rowSpan={(rowData) => rowData.suiteRowSpan}
          >
            <HeaderCell><FormattedMessage id="page.test-run-compare.header.suite-name" /></HeaderCell>
            <Cell dataKey="suiteName" />
          </Column>
          <Column flexGrow={3}>
            <HeaderCell><FormattedMessage id="page.test-run-compare.header.test-name" /></HeaderCell>
            <TestDetailsCell />
          </Column>
          {
            testRunCompareBuilds.map((matrixBuild, index) => (
              <Column width={200} flexGrow={1}>
                <HeaderCell>
                  <div>
                    <a href={`/test-run/?buildId=${matrixBuild._id}`} target="_self" title={matrixBuild._id}>
                      <FormattedMessage id="page.test-run-compare.header.test-run" values={{ number: index + 1 }} />
                    </a>
                  </div>
                </HeaderCell>
                <TestResultsCell buildid={matrixBuild._id} />
              </Column>
            ))
          }
        </Table>
      </Panel>
    </div>
  );
};

export default TestRunCompareTable;
