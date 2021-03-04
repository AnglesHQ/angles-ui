import React, { Component } from 'react';
import { getDuration } from '../../utility/TimeUtilities';
import ExecutionTable from './ExecutionTable';
import './Tables.css';

class SuiteTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      //
    };
  }

  sum = (result) => {
    if (result === null || result === undefined) {
      return 'N/A';
    }
    return Object.keys(result).reduce((sum, key) => sum + parseFloat(result[key] || 0), 0);
  }

  render() {
    const { suite, screenshots, openModal } = this.props;
    return (
      <table className="suite-table">
        <thead>
          <tr>
            <th scope="col">{`Suite: ${suite.name}`}</th>
            <td>
              <span className="suite-header">Status: </span>
              <span className={`suite-result-${suite.status}`}>
                {suite.status}
              </span>
            </td>
            <td>
              <span className="suite-header">Duration: </span>
              {getDuration(suite)}
            </td>
            <td>
              <span className="suite-header">Total: </span>
              {this.sum(suite.result)}
            </td>
            <td>
              <span className="suite-header">Pass: </span>
              {suite.result ? suite.result.PASS : '-'}
            </td>
            <td>
              <span className="suite-header">Fail: </span>
              {suite.result ? suite.result.FAIL : '-'}
            </td>
            <td>
              <span className="suite-header">Error: </span>
              {suite.result ? suite.result.ERROR : '-'}
            </td>
            <td>
              <span className="suite-header">Skipped: </span>
              {suite.result ? suite.result.SKIPPED : '-'}
            </td>
          </tr>
        </thead>
        <tbody>
          {
            suite.executions.map((execution) => [
              <ExecutionTable
                key={execution._id}
                execution={execution}
                index={execution._id}
                screenshots={screenshots}
                openModal={openModal}
              />,
            ])
        }
        </tbody>
      </table>
    );
  }
}

export default SuiteTable;
