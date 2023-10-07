import React, { useContext, useEffect } from 'react';
import {
  Row,
  Grid,
  Col,
  Panel,
} from 'rsuite';
import { VscExpandAll } from 'react-icons/vsc';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import ExpandOutlineIcon from '@rsuite/icons/ExpandOutline';
import CollaspedOutlineIcon from '@rsuite/icons/CollaspedOutline';
import { getDuration } from '../../../utility/TimeUtilities';
import ExecutionTable from './ExecutionTable';
import ExecutionStateContext from '../../../context/ExecutionStateContext';
import ExecutionsResultsBar from '../ExecutionsResultsBar';

const SuiteTable = function (props) {
  const {
    executionStates,
    setExecutionStates,
    getStatesDefault,
    setDefaultStates,
    isSuiteExpanded,
  } = useContext(ExecutionStateContext);
  const {
    suite,
    // index: suiteIndex,
    screenshots,
    openModal,
  } = props;

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
    <Panel
      className="suite-table-panel"
      classPrefix="suite-table"
      header={(
        <Grid fluid>
          <Row className="suite-table-panel-header-row">
            <Col xs={12}>
              <div>
                <span className="field-label">Suite: </span>
                { suite.name }
              </div>
            </Col>
            <Col xs={4}>
              <span className="field-label">Duration: </span>
              { getDuration(suite) }
            </Col>
            <Col xs={2}>
              <span className="field-label">Total: </span>
              { sum(suite.result) }
            </Col>
            <Col xs={4}>
              <ExecutionsResultsBar result={suite.result} />
            </Col>
            <Col xs={2}>
              <div className="suite-menu-div">
                {
                  isSuiteExpanded(suite) ? (
                    <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">{`Collapse all test cases and actions for suite ${suite.name}`}</Tooltip>}>
                      <span className="expand-icons" onClick={() => collapseAll()}>
                        <CollaspedOutlineIcon />
                      </span>
                    </OverlayTrigger>
                  ) : (
                    <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">{`Expand all test cases for suite ${suite.name}`}</Tooltip>}>
                      <span className="expand-icons" onClick={() => expandExecutions()}>
                        <ExpandOutlineIcon />
                      </span>
                    </OverlayTrigger>
                  )
                }
                <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">{`Expand all test cases and actions for suite ${suite.name}`}</Tooltip>}>
                  <span className="expand-all-icon" onClick={() => expandAll()}>
                    <VscExpandAll />
                  </span>
                </OverlayTrigger>
              </div>
            </Col>
          </Row>
        </Grid>
      )}
    >
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
    </Panel>
  );
};

export default SuiteTable;
