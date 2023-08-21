import React from 'react';
import Moment from 'react-moment';
import Popover from 'react-bootstrap/Popover';
import HistoryIcon from '@rsuite/icons/History';
import {
  Table, Whisper,
} from 'rsuite';
import InfoOutlineIcon from '@rsuite/icons/InfoOutline';
import TestDetailsTable from '../../tables/TestDetailsTable';

const { Column, HeaderCell, Cell } = Table;

const testDetailsSpeaker = (execution) => (
  <Popover title="Test Details" style={{ width: '350px' }}>
    <TestDetailsTable execution={execution} />
  </Popover>
);

const TestDetailsCell = function (props) {
  const { rowData: test } = props;
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <Cell {... props}>
      { test.testName }
      <span className="d-inline-block">
        <a className="test-history-link" title={`See execution history for ${test.testName}`} href={`/test-execution-history?executionId=${test.executionIdForHistory}`}>
          <span><HistoryIcon /></span>
        </a>
      </span>
    </Cell>
  );
};

const TestResultsCell = function (props) {
  const { rowData: test, buildId } = props;
  if (!test[buildId]) {
    return (
      // eslint-disable-next-line react/jsx-props-no-spreading
      <Cell {... props}>N/A</Cell>
    );
  }
  let testClass = 'table-info';
  if (test[buildId].status === 'PASS') {
    testClass = 'table-pass';
  } else if (test[buildId].status === 'FAIL') {
    testClass = 'table-fail';
  } else if (test[buildId].status === 'ERROR') {
    testClass = 'table-error';
  }
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <Cell {... props} className={testClass}>
      { test[buildId].status}
      {
        (test.multipleExecutions[buildId] && test.multipleExecutions[buildId] === true)
          ? (<span> - Multiple Executions</span>) : null
      }
      <Whisper placement="left" trigger="click" controlId="control-id-click" speaker={testDetailsSpeaker(test[buildId])}>
        <InfoOutlineIcon />
      </Whisper>
    </Cell>
  );
};

const TestRunCompareTable = function (props) {
  const { testRunCompareBuilds } = props;

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
      detailName: 'Test Run Name',
    };
    const startDates = {
      id: 2,
      detailName: 'Start Date',
    };
    const environments = {
      id: 3,
      detailName: 'Environment',
    };
    testRunCompareBuilds.forEach((build) => {
      names[build._id] = build.name;
      startDates[build._id] = <Moment format="DD-MM-YYYY HH:mm">{build.start}</Moment>;
      environments[build._id] = build.environment.name;
    });
    buildDetailsRows.push(names);
    buildDetailsRows.push(startDates);
    buildDetailsRows.push(environments);
    return buildDetailsRows;
  };

  return (
    <div>
      <Table
        className="test-run-compare-table"
        data={generateBuildDetailsCompare()}
        wordWrap="break-word"
        bordered
        cellBordered
        autoHeight
        headerHeight={40}
      >
        <Column width={40}>
          <HeaderCell>#</HeaderCell>
          <Cell
            dataKey="id"
          />
        </Column>
        <Column flexGrow={5}>
          <HeaderCell>Details</HeaderCell>
          <Cell dataKey="detailName" />
        </Column>
        {
          testRunCompareBuilds.map((matrixBuild, index) => (
            <Column width={200} flexGrow={1}>
              <HeaderCell>
                <div>
                  <a href={`/test-run/?buildId=${matrixBuild._id}`} target="_self" title={matrixBuild._id}>
                    {`Test Run ${index + 1}`}
                  </a>
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
        bordered
        cellBordered
        autoHeight
        headerHeight={40}
      >
        <Column width={40}>
          <HeaderCell>#</HeaderCell>
          <Cell
            dataKey="id"
          />
        </Column>
        <Column
          flexGrow={2}
        >
          <HeaderCell>GroupId</HeaderCell>
          <Cell dataKey="groupId" />
        </Column>
        <Column flexGrow={3}>
          <HeaderCell>ArtifactId</HeaderCell>
          <Cell dataKey="artifactId" />
        </Column>
        {
          testRunCompareBuilds.map((matrixBuild, index) => (
            <Column width={200} flexGrow={1}>
              <HeaderCell>
                <div>
                  <a href={`/test-run/?buildId=${matrixBuild._id}`} target="_self" title={matrixBuild._id}>
                    {`Test Run ${index + 1}`}
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
        bordered
        cellBordered
        headerHeight={40}
      >
        <Column width={40}>
          <HeaderCell>#</HeaderCell>
          <Cell
            dataKey="id"
          />
        </Column>
        <Column
          flexGrow={2}
          rowSpan={(rowData) => rowData.suiteRowSpan}
        >
          <HeaderCell>Suite Name</HeaderCell>
          <Cell dataKey="suiteName" />
        </Column>
        <Column flexGrow={3}>
          <HeaderCell>Test Name</HeaderCell>
          <TestDetailsCell />
        </Column>
        {
          testRunCompareBuilds.map((matrixBuild, index) => (
            <Column width={200} flexGrow={1}>
              <HeaderCell>
                <div>
                  <a href={`/test-run/?buildId=${matrixBuild._id}`} target="_self" title={matrixBuild._id}>
                    {`Test Run ${index + 1}`}
                  </a>
                </div>
              </HeaderCell>
              <TestResultsCell buildId={matrixBuild._id} />
            </Column>
          ))
        }
      </Table>
    </div>
  );
};

export default TestRunCompareTable;
