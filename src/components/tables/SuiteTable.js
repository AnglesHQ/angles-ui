import React, { useContext, useEffect } from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { getDuration } from '../../utility/TimeUtilities';
import ExecutionTable from './ExecutionTable';
import ExecutionStateContext from '../../context/ExecutionStateContext';
import './Tables.css';

const SuiteTable = function (props) {
  const {
    executionStates,
    setExecutionStates,
    getStatesDefault,
    setDefaultStates,
  } = useContext(ExecutionStateContext);
  const { suite, screenshots, openModal } = props;

  const sum = (result) => {
    if (result === null || result === undefined) {
      return 'N/A';
    }
    return Object.keys(result)
      .reduce((sumValue, key) => sumValue + parseFloat(result[key] || 0), 0);
  };

  useEffect(() => {
    // set the default state of the executions and actions
    setDefaultStates(suite);
  }, []);

  const expandAll = () => {
    setExecutionStates(getStatesDefault(true, true, suite));
  };

  const expandExecutions = () => {
    setExecutionStates(getStatesDefault(true, false, suite));
  };

  const collapseAll = () => {
    setExecutionStates(getStatesDefault(false, false, suite));
  };

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
            {sum(suite.result)}
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
              <span className="expand-icons" onClick={() => expandAll()}>
                <i className="fas fa-angle-double-down" />
              </span>
            </OverlayTrigger>
            <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">{`Expand all test cases for suite ${suite.name}`}</Tooltip>}>
              <span className="expand-icons" onClick={() => expandExecutions()}>
                <i className="fas fa-angle-down" />
              </span>
            </OverlayTrigger>
            <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">{`Collapse all test cases and actions for suite ${suite.name}`}</Tooltip>}>
              <span className="expand-icons" onClick={() => collapseAll()}>
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
              key={`${execution._id}.${(executionStates[execution._id]) ? (executionStates[execution._id]).isOpen : false}`}
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
};

export default SuiteTable;
