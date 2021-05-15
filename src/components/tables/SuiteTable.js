import React, { Component } from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { getDuration } from '../../utility/TimeUtilities';
import ExecutionTable from './ExecutionTable';
import './Tables.css';

class SuiteTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      executionStates: this.getStatesDefault(false),
    };
  }

  sum = (result) => {
    if (result === null || result === undefined) {
      return 'N/A';
    }
    return Object.keys(result).reduce((sum, key) => sum + parseFloat(result[key] || 0), 0);
  }

  expandAll = () => {
    this.setState({ executionStates: this.getStatesDefault(true, true) });
  }

  expandExecutions = () => {
    this.setState({ executionStates: this.getStatesDefault(true, false) });
  }

  collapseAll = () => {
    this.setState({ executionStates: this.getStatesDefault(false, false) });
  }

  getStatesDefault = (expanded, expandActions) => {
    const executionStates = {};
    const { suite } = this.props;
    suite.executions.forEach((execution) => {
      executionStates[execution._id] = {
        isOpen: expanded,
        actions: [],
      };
      execution.actions.forEach((action, index) => {
        executionStates[execution._id].actions[index] = expandActions;
      });
    });
    return executionStates;
  }

  toggleExecution = (executionId) => {
    const { executionStates } = this.state;
    executionStates[executionId].isOpen = !executionStates[executionId].isOpen;
    this.setState({ executionStates });
  }

  toggleAction = (executionId, actionIndex) => {
    const { executionStates } = this.state;
    executionStates[executionId]
      .actions[actionIndex] = !executionStates[executionId].actions[actionIndex];
    this.setState({ executionStates });
  }

  render() {
    const { suite, screenshots, openModal } = this.props;
    const { executionStates } = this.state;
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
            <td>
              <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">{`Expand all test cases and actions for suite ${suite.name}`}</Tooltip>}>
                <span className="expand-icons" onClick={() => this.expandAll()}>
                  <i className="fas fa-angle-double-down" />
                </span>
              </OverlayTrigger>
              <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">{`Expand all test cases for suite ${suite.name}`}</Tooltip>}>
                <span className="expand-icons" onClick={() => this.expandExecutions()}>
                  <i className="fas fa-angle-down" />
                </span>
              </OverlayTrigger>
              <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">{`Collapse all test cases and actions for suite ${suite.name}`}</Tooltip>}>
                <span className="expand-icons" onClick={() => this.collapseAll()}>
                  <i className="fas fa-angle-up" />
                </span>
              </OverlayTrigger>
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
                executionState={executionStates[execution._id]}
                toggleExecution={this.toggleExecution}
                toggleAction={this.toggleAction}
              />,
            ])
        }
        </tbody>
      </table>
    );
  }
}

export default SuiteTable;
