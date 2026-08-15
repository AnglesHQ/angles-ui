import React, { useContext } from 'react';
import { FormattedMessage } from 'react-intl';
import HistoryIcon from '@rsuite/icons/History';
import ExpandOutlineIcon from '@rsuite/icons/ExpandOutline';
import CollaspedOutlineIcon from '@rsuite/icons/CollaspedOutline';
import { Tooltip, Whisper } from 'rsuite';
import DeviceIcon from '@rsuite/icons/Device';
import CalendarIcon from '@rsuite/icons/Calendar';
import TimeIcon from '@rsuite/icons/Time';
import Moment from 'react-moment';
import ActionComponent from './ActionComponent';
import ExecutionStateContext from '../../../context/ExecutionStateContext';
import { getDuration } from '../../../utility/TimeUtilities';

const ExecutionTable = function (props) {
  const { isExecutionExpanded, toggleExecution } = useContext(ExecutionStateContext);
  const {
    index,
    execution,
    screenshots,
    openModal,
    showScreenshots,
    showHistoryLink,
  } = props;

  const getPlatformName = (executionToGenerateNameFor) => {
    const platformsToDisplay = [];
    if (executionToGenerateNameFor.platforms) {
      executionToGenerateNameFor.platforms.forEach((platform) => {
        if (platform.deviceName) {
          platformsToDisplay.push(`${platform.deviceName} [${platform.platformName}${platform.platformVersion ? platform.platformVersion : null}]`);
        } else {
          platformsToDisplay.push(`${platform.browserName}${platform.browserVersion ? ` - ${platform.browserVersion}` : null} [${platform.platformName}]`);
        }
      });
    }
    return platformsToDisplay.join(', ');
  };

  const status = execution.status.toLowerCase();
  const expanded = isExecutionExpanded(execution._id);
  const actionCount = execution.actions ? execution.actions.length : 0;

  return (
    <div className="test-run-suite-body">
      <div
        key={`execution_${index}`}
        className={`execution-row execution-row-${status} ${expanded ? 'execution-row-expanded' : ''}`}
      >
        {/* Header line: toggle, test name + status chip, meta, history link. */}
        <div
          className="execution-header"
          onClick={() => toggleExecution(execution._id)}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              toggleExecution(execution._id);
            }
          }}
        >
          <span className="execution-toggle">
            {
              expanded ? (
                <CollaspedOutlineIcon className="execution-icon" />
              ) : <ExpandOutlineIcon className="execution-icon" />
            }
          </span>
          <div className="execution-header-main">
            <div className="execution-title-line">
              <span className="execution-test-name">{execution.title}</span>
              <span className={`execution-status-chip status-${status}`}>
                {execution.status}
              </span>
            </div>
            <div className="execution-details-container">
              <span className="execution-detail">
                <CalendarIcon />
                <Moment utc format="DD-MM-YYYY HH:mm:ss">
                  {execution.start}
                </Moment>
              </span>
              <span className="execution-detail">
                <TimeIcon />
                <span>{getDuration(execution)}</span>
              </span>
              { execution.platforms && execution.platforms.length > 0 ? (
                <span className="execution-detail">
                  <DeviceIcon />
                  <span>{getPlatformName(execution)}</span>
                </span>
              ) : null }
              { actionCount > 0 ? (
                <span className="execution-detail">
                  <FormattedMessage
                    id="common.component.suite-table.execution.action-count"
                    values={{ count: actionCount }}
                  />
                </span>
              ) : null }
            </div>
          </div>
          { showHistoryLink !== false ? (
            <Whisper
              placement="top"
              trigger="hover"
              speaker={<Tooltip><FormattedMessage id="common.component.suite-table.icon.test-history" /></Tooltip>}
            >
              <a
                className="test-history-link"
                href={`/test-execution-history?executionId=${execution._id}`}
                onClick={(event) => event.stopPropagation()}
              >
                <HistoryIcon className="execution-history-icon" />
              </a>
            </Whisper>
          ) : null }
        </div>
        { expanded ? (
          <div key={`execution_actions_${index}`} className="actions-row">
            { execution.actions.map((action, actionIndex) => [
              <ActionComponent
                key={index}
                action={action}
                index={index}
                screenshots={screenshots}
                openModal={openModal}
                actionIndex={actionIndex}
                execution={execution}
                showScreenshots={showScreenshots}
              />,
            ])}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ExecutionTable;
