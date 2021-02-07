import React, { Component } from 'react'
import Moment from 'react-moment';
import Popover from 'react-bootstrap/Popover'
import OverlayTrigger from 'react-bootstrap//OverlayTrigger'
import TestDetailsTable from '../tables/TestDetailsTable';
import { withRouter} from 'react-router-dom';

class MatrixTable extends Component {

constructor(props) {
  super(props);
  this.state = {
    headers: [],
    matrixSuites: {},
    artifacts: {}
  };
}

reorganiseSuitsForMatrix = () => {
  let headers = [];
  let matrixSuites = {}
  let artifacts = {}

  this.props.matrixBuilds.forEach(build => {
    // populate the header for each build
    headers.push(build);

    if (build.artifacts && build.artifacts.length > 0) {
        build.artifacts.forEach(artifact => {

          // set the artifact identifier
          let artifactIdentifier;
          if (artifact.groupId) {
            artifactIdentifier = `${artifact.groupId}.${artifact.artifactId}`;
          } else {
            artifactIdentifier = `${artifact.artifactId}`;
          }
          if (!artifacts[artifactIdentifier]) {
            artifacts[artifactIdentifier]={};
          }
          artifacts[artifactIdentifier][build._id] = artifact.version;
        })
    }

    // go through the invividual states.
    build.suites.forEach(suite => {

      if (!matrixSuites[suite.name]) {
        matrixSuites[suite.name] = {}
      }
      // go through each of the executions
      suite.executions.forEach(execution => {
        if (!matrixSuites[suite.name][execution.title]){
          matrixSuites[suite.name][execution.title] = {};
        }
        // set the results for each build.
        matrixSuites[suite.name][execution.title][build._id] = execution;
      })
    })
  })
  this.setState({headers, matrixSuites, artifacts});
}

componentDidMount() {
    this.reorganiseSuitsForMatrix();
}

render() {

  // populate suite rows and test rows
  let rows = [];

  //start date
  rows.push(<tr key={`artifact-header-start-date`}>
            <td><b>Start Date</b></td>
            {
              this.state.headers.map((build) => {
                return <td key={`start_${build._id}`}><Moment format="DD-MM-YYYY HH:mm">{build.start}</Moment></td>
              })
            }
            </tr>);

  // Environment
  rows.push(<tr key={`artifact-header-environment`}>
            <td><b>Environment</b></td>
            {
              this.state.headers.map((build) => {
                return <td key={`environment_${build._id}`}>{build.environment.name}</td>
              })
            }
            </tr>);
  rows.push(<tr key={`artifact-footer-environment`}><td colSpan="100%"></td></tr>);

  // artifacts
  if (this.state.artifacts && Object.keys(this.state.artifacts).length > 0) {
    rows.push(<tr key={`artifact-header`} className="table-info"><td colSpan="100%"><b>Artifacts [{Object.keys(this.state.artifacts).length}]</b></td></tr>);
    Object.keys(this.state.artifacts).forEach(artifactIdentifier => {
        let versions = [];
        this.state.headers.forEach(build => {
            let version = this.state.artifacts[artifactIdentifier][build._id]
            if (version) {
              versions.push(<td key={`${artifactIdentifier}.${build._id}`}>{version }</td>);
            } else {
              versions.push(<td key={`${artifactIdentifier}.${build._id}`}>N/A</td>);
            }
        })
        let versionArray = Object.values(this.state.artifacts[artifactIdentifier]);
        let uniquearray = versionArray.filter(function(v,i) { return i===versionArray.lastIndexOf(v); });
        rows.push(<tr key={artifactIdentifier} className={ uniquearray.length > 1 ? 'matrix-versions-highlight' : '' }>
            <td key={`main-${artifactIdentifier}`}><b>{artifactIdentifier}</b></td>
            {versions}
        </tr>);
    })
    rows.push(<tr key={`artifact-footer`}><td colSpan="100%"></td></tr>);
  }

  Object.keys(this.state.matrixSuites).forEach(suiteName => {
    rows.push(<tr key={suiteName} className="table-info"><td colSpan="100%"><b>Suite:</b> {suiteName}</td></tr>);
    Object.keys(this.state.matrixSuites[suiteName]).forEach(testName => {
      let testResults = [];
      this.state.headers.forEach(build => {
          let testDetails = this.state.matrixSuites[suiteName][testName][build._id]
          if (testDetails) {
            let popover = (
              <Popover id="popover-basic">
                <Popover.Title as="h3"><b>Test: </b>{testDetails.title}</Popover.Title>
                <Popover.Content>
                    <TestDetailsTable execution={testDetails}/>
                </Popover.Content>
              </Popover>
            );
            testResults.push(<td key={`${suiteName}.${testName}${build._id}`} className={`${(testDetails.status === 'PASS') ? "table-success" : (testDetails.status === 'FAIL')? "table-danger" : (testDetails.status === 'ERROR')? "table-warning" : null }`}>
            <OverlayTrigger trigger={['hover', 'focus']} overlay={popover}>
              <span className="d-inline-block">
                <div disabled style={{ pointerEvents: 'none' }}>
                    {testDetails.status}
                </div>
              </span>
            </OverlayTrigger>
            </td>);
          } else {
            testResults.push(<td key={`${suiteName}.${testName}${build._id}`}>N/A</td>);
          }
      })
      rows.push(<tr key={`${suiteName}.${testName}-row`}>
          <td><b>{testName}</b></td>
          {testResults}
      </tr>);
    })
  })

  return (
    <table className="table table-hover matrix-table">
    <thead className="thead-dark">
      <tr>
        <th scope="col">Matrix</th>
        {
          this.state.headers.map(build => {
              return <th key={build._id} scope="col"><div>{build.name}</div></th>
          })
        }
      </tr>
    </thead>
    <tbody>
       {rows}
    </tbody>
  </table>
  )
}

};

export default withRouter(MatrixTable);
