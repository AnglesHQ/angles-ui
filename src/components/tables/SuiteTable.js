import React, { useContext, useEffect } from 'react';
import {
  Row,
  Grid,
  Col,
  Panel,
} from 'rsuite';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import ExpandOutlineIcon from '@rsuite/icons/ExpandOutline';
import CollaspedOutlineIcon from '@rsuite/icons/CollaspedOutline';
import PlusRoundIcon from '@rsuite/icons/PlusRound';
import { getDuration } from '../../utility/TimeUtilities';
import ExecutionTable from './ExecutionTable';
import ExecutionStateContext from '../../context/ExecutionStateContext';
import ExecutionsResultsBar from '../common/ExecutionsResultsBar';

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
    index: suiteIndex,
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
    <>
      <div key={suite.name} className="test-suite-header">
        <Grid fluid>
          <Row className="show-grid">
            <Col xs={1}>
              <span>{suiteIndex + 1}</span>
            </Col>
            <Col xs={15}>
              <div>
                <span className="field-label">Suite: </span>
                {suite.name}
              </div>
              <div>
                <span className="field-label">Duration: </span>
                {getDuration(suite)}
              </div>
            </Col>
            <Col xs={2}>
              {`Total: ${sum(suite.result)}`}
            </Col>
            <Col xs={4}>
              <ExecutionsResultsBar result={suite.result} />
            </Col>
            <Col xs={2} className="suite-menu-div">
              <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">{`Expand all test cases and actions for suite ${suite.name}`}</Tooltip>}>
                <span className="expand-icons" onClick={() => expandAll()}>
                  <PlusRoundIcon />
                </span>
              </OverlayTrigger>
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
            </Col>
          </Row>
        </Grid>
      </div>
      <Panel>
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
    </>
  );
};

export default SuiteTable;
