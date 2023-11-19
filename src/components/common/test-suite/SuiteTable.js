import React, { useContext, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
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
import ExecutionsResultsBar from '../results-bar';

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
      className="test-run-suite-panel"
      classPrefix="test-run-suite"
      header={(
        <Grid fluid>
          <Row className="test-run-suite-header">
            <Col xs={12}>
              <div>
                <span className="field-label">
                  <FormattedMessage id="common.component.suite-table.header.suite" />
                </span>
                <span>: </span>
                { suite.name }
              </div>
            </Col>
            <Col xs={4}>
              <span className="field-label">
                <FormattedMessage id="common.component.suite-table.header.duration" />
              </span>
              <span>: </span>
              { getDuration(suite) }
            </Col>
            <Col xs={2}>
              <span className="field-label">
                <FormattedMessage id="common.component.suite-table.header.total" />
              </span>
              <span>: </span>
              { sum(suite.result) }
            </Col>
            <Col xs={4}>
              <ExecutionsResultsBar result={suite.result} />
            </Col>
            <Col xs={2}>
              <div className="suite-menu-div">
                {
                  isSuiteExpanded(suite) ? (
                    <OverlayTrigger overlay={(
                      <Tooltip id="tooltip-disabled">
                        <FormattedMessage id="common.component.suite-table.header.collapse-all" />
                      </Tooltip>
                    )}
                    >
                      <span className="expand-icons" onClick={() => collapseAll()}>
                        <CollaspedOutlineIcon />
                      </span>
                    </OverlayTrigger>
                  ) : (
                    <OverlayTrigger overlay={(
                      <Tooltip id="tooltip-disabled">
                        <FormattedMessage id="common.component.suite-table.header.expand-all" />
                      </Tooltip>
                    )}
                    >
                      <span className="expand-icons" onClick={() => expandExecutions()}>
                        <ExpandOutlineIcon />
                      </span>
                    </OverlayTrigger>
                  )
                }
                <OverlayTrigger overlay={(
                  <Tooltip id="tooltip-disabled">
                    <FormattedMessage id="common.component.suite-table.header.expand-all-actions" />
                  </Tooltip>
                )}
                >
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
