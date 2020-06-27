import React, { Component } from 'react'
import timeUtility from '../../utility/TimeUtilities'
import ExecutionTable from './ExecutionTable';
import './Tables.css';

class SuiteTable extends Component {

  constructor(props) {
    super(props);
    this.state = {
      suite: [],
    };
      //this.calculateMetricsForBuilds(props.builds);
  }

  render() {
    return (
      <table className="suite-table">
      <thead>
        <tr>
          <th scope="col">Suite: {this.props.suite.name}</th>
          <td>Status: {this.props.suite.status}</td>
          <td>Duration: { timeUtility.getDuration(this.props.suite) }</td>
        </tr>
      </thead>
      <tbody>
        { this.props.suite.executions.map((execution, index) => {
          return [
            <ExecutionTable key={"execution_" + index} execution={execution} index={index} screenshots={this.props.screenshots}/>
          ]
        })
      }
      </tbody>
    </table>
    )
  }

};

export default SuiteTable
