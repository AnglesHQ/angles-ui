import React, { useEffect } from 'react';
import Moment from 'react-moment';
import Popover from 'react-bootstrap/Popover';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import TestDetailsTable from './TestDetailsTable';

const MatrixTable = function (props) {
  const [headers, setHeaders] = React.useState([]);
  const [matrixSuites, setMatrixSuites] = React.useState({});
  const [artifacts, setArtifacts] = React.useState({});

  const reorganiseSuitsForMatrix = () => {
    const headerValues = [];
    const matrixSuitesValues = {};
    const artifactValues = {};
    const { matrixBuilds } = props;
    matrixBuilds.forEach((build) => {
      // populate the header for each build
      headerValues.push(build);

      if (build.artifacts && build.artifacts.length > 0) {
        build.artifacts.forEach((artifact) => {
          // set the artifact identifier
          let artifactIdentifier;
          if (artifact.groupId) {
            artifactIdentifier = `${artifact.groupId}.${artifact.artifactId}`;
          } else {
            artifactIdentifier = `${artifact.artifactId}`;
          }
          if (!artifactValues[artifactIdentifier]) {
            artifactValues[artifactIdentifier] = {};
          }
          artifactValues[artifactIdentifier][build._id] = artifact.version;
        });
      }

      // go through the invividual states.
      build.suites.forEach((suite) => {
        if (!matrixSuitesValues[suite.name]) {
          matrixSuitesValues[suite.name] = {};
        }
        // go through each of the executions
        suite.executions.forEach((execution) => {
          if (!matrixSuitesValues[suite.name][execution.title]) {
            matrixSuitesValues[suite.name][execution.title] = {};
          }
          // set the results for each build.
          matrixSuitesValues[suite.name][execution.title][build._id] = execution;
        });
      });
    });
    setHeaders(headerValues);
    setArtifacts(artifactValues);
    setMatrixSuites(matrixSuitesValues);
  };

  useEffect(() => {
    reorganiseSuitsForMatrix();
  }, []);

  const generateMatrixRows = () => {
    const rows = [];
    // start date
    rows.push(
      <tr key="artifact-header-start-date">
        <td>
          <b>Start Date</b>
        </td>
        {
          headers.map((build) => (
            <td key={`start_${build._id}`}>
              <Moment format="DD-MM-YYYY HH:mm">{build.start}</Moment>
            </td>
          ))
        }
      </tr>,
    );

    // Environment
    rows.push(
      <tr key="artifact-header-environment">
        <td>
          <b>Environment</b>
        </td>
        {
          headers.map((build) => <td key={`environment_${build._id}`}>{build.environment.name}</td>)
        }
      </tr>,
    );
    rows.push(<tr key="artifact-footer-environment"><td colSpan="100%" /></tr>);

    // artifacts
    if (artifacts && Object.keys(artifacts).length > 0) {
      rows.push(
        <tr key="artifact-header" className="table-info">
          <td colSpan="100%"><b>{`Artifacts [${Object.keys(artifacts).length}]`}</b></td>
        </tr>,
      );
      Object.keys(artifacts).forEach((artifactIdentifier) => {
        const versions = [];
        headers.forEach((build) => {
          const version = artifacts[artifactIdentifier][build._id];
          if (version) {
            versions.push(<td key={`${artifactIdentifier}.${build._id}`}>{version }</td>);
          } else {
            versions.push(<td key={`${artifactIdentifier}.${build._id}`}>N/A</td>);
          }
        });
        const versionArray = Object.values(artifacts[artifactIdentifier]);
        const uniquearray = versionArray.filter((v, i) => i === versionArray.lastIndexOf(v));
        rows.push(
          <tr key={artifactIdentifier} className={uniquearray.length > 1 ? 'matrix-versions-highlight' : ''}>
            <td key={`main-${artifactIdentifier}`}><b>{artifactIdentifier}</b></td>
            {versions}
          </tr>,
        );
      });
      rows.push(<tr key="artifact-footer"><td colSpan="100%" /></tr>);
    }

    Object.keys(matrixSuites).forEach((suiteName) => {
      rows.push(
        <tr key={suiteName} className="table-info">
          <td colSpan="100%">
            <b>Suite:</b>
            {` ${suiteName}`}
          </td>
        </tr>,
      );
      Object.keys(matrixSuites[suiteName]).forEach((testName) => {
        const testResults = [];
        let firstExecution;
        headers.forEach((build) => {
          const testDetails = matrixSuites[suiteName][testName][build._id];
          if (testDetails) {
            if (!firstExecution) firstExecution = testDetails;
            const popover = (
              <Popover id="popover-basic">
                <Popover.Title as="h3">
                  <b>Test: </b>
                  {testDetails.title}
                </Popover.Title>
                <Popover.Content>
                  <TestDetailsTable execution={testDetails} />
                </Popover.Content>
              </Popover>
            );

            // determine classname by status.
            let testClass = null;
            if (testDetails.status === 'PASS') {
              testClass = 'table-success';
            } else if (testDetails.status === 'FAIL') {
              testClass = 'table-danger';
            } else if (testDetails.status === 'ERROR') {
              testClass = 'table-warning';
            }
            testResults.push(
              <td key={`${suiteName}.${testName}${build._id}`} className={testClass}>
                <span className="d-inline-block">
                  <div>
                    {testDetails.status}
                    <OverlayTrigger trigger="click" rootClose overlay={popover}>
                      <span className="matrix-info-icon">
                        <i className="fas fa-info-circle" />
                      </span>
                    </OverlayTrigger>
                  </div>
                </span>
              </td>,
            );
          } else {
            testResults.push(<td key={`${suiteName}.${testName}${build._id}`}>N/A</td>);
          }
        });
        rows.push(
          <tr key={`${suiteName}.${testName}-row`}>
            <td>
              <b><span>{`${testName} `}</span></b>
              <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">{`See execution history for ${testName}`}</Tooltip>}>
                <span className="d-inline-block">
                  <a className="test-history-link" title={`See execution history for ${testName}`} href={`/history?executionId=${firstExecution._id}`}>
                    <span><i className="fa fa-history" aria-hidden="true">history</i></span>
                  </a>
                </span>
              </OverlayTrigger>
            </td>
            {testResults}
          </tr>,
        );
      });
    });
    return rows;
  };

  return (
    <table className="table table-hover matrix-table">
      <thead className="thead-dark">
        <tr>
          <th scope="col">Matrix</th>
          {
            headers.map((build) => <th key={build._id} scope="col"><div>{build.name}</div></th>)
          }
        </tr>
      </thead>
      <tbody>
        {generateMatrixRows()}
      </tbody>
    </table>
  );
};

export default MatrixTable;
