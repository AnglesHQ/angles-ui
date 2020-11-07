import React, { Component } from 'react'
import Moment from 'react-moment';
import { withRouter} from 'react-router-dom';

class MatrixTable extends Component {

constructor(props) {
  super(props);
  this.state = {
    headers: [],
    matrixSuites: {}
  };
}

reorganiseSuitsForMatrix() {
  let headers = [];
  let matrixSuites = {}
  this.props.matrixBuilds.forEach(build => {
    // populate the header for each build
    headers.push(build);
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
  this.setState({headers, matrixSuites});
}

componentDidMount() {
    this.reorganiseSuitsForMatrix();
}

render() {

  // populate suite rows and test rows
  let rows = [];
  Object.keys(this.state.matrixSuites).forEach(suiteName => {
    rows.push(<tr key={suiteName}><td colSpan="100%">Suite: {suiteName}</td></tr>);
    Object.keys(this.state.matrixSuites[suiteName]).forEach(testName => {
      let testResults = [];
      this.state.headers.forEach(build => {
          let testDetails = this.state.matrixSuites[suiteName][testName][build._id]
          testResults.push(<td>{testDetails.status}</td>);
      })
      rows.push(<tr key={testName}>
          <td>{testName}</td>
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
                return <th key={build._id} scope="col"><Moment format="HH:mm:ss">{build.start}</Moment></th>
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
