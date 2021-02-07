import React, { Component } from 'react'
import {getDuration} from '../../utility/TimeUtilities'
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

  sum = (result) => {
    if (result === null || result === undefined) {
      return "N/A";
    }
    return Object.keys(result).reduce((sum,key)=>sum+parseFloat(result[key]||0),0);
  }

  render() {
    return (
      <table className="suite-table">
      <thead>
        <tr>
          <th scope="col">Suite: {this.props.suite.name}</th>
          <td><span className={"suite-header"}>Status:</span> <span className={`suite-result-${this.props.suite.status}`}>{this.props.suite.status}</span></td>
          <td><span className={"suite-header"}>Duration:</span> { getDuration(this.props.suite) }</td>
          <td><span className={"suite-header"}>Total:</span> { this.sum(this.props.suite.result) }</td>
          <td><span className={"suite-header"}>Pass:</span> { this.props.suite.result ? this.props.suite.result.PASS  : "-" }</td>
          <td><span className={"suite-header"}>Fail:</span> { this.props.suite.result ? this.props.suite.result.FAIL  : "-"  }</td>
          <td><span className={"suite-header"}>Error:</span> { this.props.suite.result ? this.props.suite.result.ERROR  : "-"  }</td>
          <td><span className={"suite-header"}>Skipped:</span> { this.props.suite.result ? this.props.suite.result.SKIPPED  : "-"  }</td>
        </tr>
      </thead>
      <tbody>
        { this.props.suite.executions.map((execution, index) => {
          return [
            <ExecutionTable key={"execution_" + index} execution={execution} index={index} screenshots={this.props.screenshots} openModal={this.props.openModal}/>
          ]
        })
      }
      </tbody>
    </table>
    )
  }

};

export default SuiteTable
