import React, { Component } from 'react';
import Moment from 'react-moment';
import Popover from 'react-bootstrap/Popover';
import OverlayTrigger from 'react-bootstrap//OverlayTrigger';
import Tooltip from 'react-bootstrap//Tooltip';
import { withRouter } from 'react-router-dom';
import TestDetailsTable from './TestDetailsTable';

class MatrixTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      headers: [],
      matrixSuites: {},
      artifacts: {},
    };
  }

  componentDidMount = () => {
    this.reorganiseSuitsForMatrix();
  }

  reorganiseSuitsForMatrix = () => {
    const headers = [];
    const matrixSuites = {};
    const artifacts = {};
    const { matrixBuilds } = this.props;
    matrixBuilds.forEach((build) => {
      // populate the header for each build
      headers.push(build);

      if (build.artifacts && build.artifacts.length > 0) {
        build.artifacts.forEach((artifact) => {
          // set the artifact identifier
          let artifactIdentifier;
          if (artifact.groupId) {
            artifactIdentifier = `${artifact.groupId}.${artifact.artifactId}`;
          } else {
            artifactIdentifier = `${artifact.artifactId}`;
          }
          if (!artifacts[artifactIdentifier]) {
            artifacts[artifactIdentifier] = {};
          }
          artifacts[artifactIdentifier][build._id] = artifact.version;
        });
      }

      // go through the invividual states.
      build.suites.forEach((suite) => {
        if (!matrixSuites[suite.name]) {
          matrixSuites[suite.name] = {};
        }
        // go through each of the executions
        suite.executions.forEach((execution) => {
          if (!matrixSuites[suite.name][execution.title]) {
            matrixSuites[suite.name][execution.title] = {};
          }
          // set the results for each build.
          matrixSuites[suite.name][execution.title][build._id] = execution;
        });
      });
    });
    this.setState({ headers, matrixSuites, artifacts });
  }

  render() {
    // populate suite rows and test rows
    const rows = [];
    const { headers, artifacts, matrixSuites } = this.state;
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
                <OverlayTrigger trigger={['hover', 'focus']} overlay={popover}>
                  <span className="d-inline-block">
                    <div disabled style={{ pointerEvents: 'none' }}>
                      {testDetails.status}
                    </div>
                  </span>
                </OverlayTrigger>
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
          {rows}
        </tbody>
      </table>
    );
  }
}

export default withRouter(MatrixTable);
