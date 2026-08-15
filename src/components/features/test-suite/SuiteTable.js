import React, { useContext, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import {
  Panel,
  Tooltip,
  Whisper,
} from 'rsuite';
import { VscExpandAll } from 'react-icons/vsc';
import { MdImage, MdHideImage } from 'react-icons/md';
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
    showHistoryLink,
  } = props;

  const [showScreenshots, setShowScreenshots] = useState(true);

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
        <div className="suite-header-inner">
          <div className="suite-header-info">
            <div className="suite-header-title" title={suite.name}>{suite.name}</div>
            <div className="suite-header-meta">
              <span className="suite-header-meta-item">
                <span className="field-label">
                  <FormattedMessage id="common.component.suite-table.header.duration" />
                </span>
                <span>: </span>
                {getDuration(suite)}
              </span>
              <span className="suite-header-meta-sep">•</span>
              <span className="suite-header-meta-item">
                <span className="field-label">
                  <FormattedMessage id="common.component.suite-table.header.total" />
                </span>
                <span>: </span>
                {sum(suite.result)}
              </span>
              <span className="suite-header-meta-sep">•</span>
              <span className="suite-header-meta-item">
                <FormattedMessage
                  id="common.component.suite-table.header.execution-count"
                  values={{ count: suite.executions.length }}
                />
              </span>
            </div>
          </div>
          <div className="suite-header-results">
            <ExecutionsResultsBar result={suite.result} />
          </div>
          <div className="suite-header-actions">
            <Whisper
              placement="top"
              trigger="hover"
              speaker={(
                <Tooltip>
                  <FormattedMessage id={showScreenshots
                    ? 'common.component.suite-table.header.hide-screenshots'
                    : 'common.component.suite-table.header.show-screenshots'}
                  />
                </Tooltip>
              )}
            >
              <span
                className="suite-header-action-icon"
                onClick={() => setShowScreenshots(!showScreenshots)}
              >
                { showScreenshots ? <MdImage /> : <MdHideImage /> }
              </span>
            </Whisper>
            {
              isSuiteExpanded(suite) ? (
                <Whisper
                  placement="top"
                  trigger="hover"
                  speaker={(
                    <Tooltip>
                      <FormattedMessage id="common.component.suite-table.header.collapse-all" />
                    </Tooltip>
                  )}
                >
                  <span className="suite-header-action-icon" onClick={() => collapseAll()}>
                    <CollaspedOutlineIcon />
                  </span>
                </Whisper>
              ) : (
                <Whisper
                  placement="top"
                  trigger="hover"
                  speaker={(
                    <Tooltip>
                      <FormattedMessage id="common.component.suite-table.header.expand-all" />
                    </Tooltip>
                  )}
                >
                  <span className="suite-header-action-icon" onClick={() => expandExecutions()}>
                    <ExpandOutlineIcon />
                  </span>
                </Whisper>
              )
            }
            <Whisper
              placement="top"
              trigger="hover"
              speaker={(
                <Tooltip>
                  <FormattedMessage id="common.component.suite-table.header.expand-all-actions" />
                </Tooltip>
              )}
            >
              <span className="suite-header-action-icon" onClick={() => expandAll()}>
                <VscExpandAll />
              </span>
            </Whisper>
          </div>
        </div>
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
            showScreenshots={showScreenshots}
            showHistoryLink={showHistoryLink}
          />,
        ])
      }
    </Panel>
  );
};

export default SuiteTable;
