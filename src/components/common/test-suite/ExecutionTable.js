import React, { useContext } from 'react';
import { FormattedMessage } from 'react-intl';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import HistoryIcon from '@rsuite/icons/History';
import ExpandOutlineIcon from '@rsuite/icons/ExpandOutline';
import CollaspedOutlineIcon from '@rsuite/icons/CollaspedOutline';
import { FlexboxGrid } from 'rsuite';
import DeviceIcon from '@rsuite/icons/Device';
import CalendarIcon from '@rsuite/icons/Calendar';
import Moment from 'react-moment';
import ActionComponent from './ActionComponent';
import ExecutionStateContext from '../../../context/ExecutionStateContext';

const ExecutionTable = function (props) {
  const { isExecutionExpanded, toggleExecution } = useContext(ExecutionStateContext);
  const {
    index,
    execution,
    screenshots,
    openModal,
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

  return (
    <div className="test-run-suite-body">
      <div key={`execution_${index}`} className="test-row">
        <div className={`${execution.status}`}>
          <FlexboxGrid justify="space-between">
            <FlexboxGrid.Item colspan={1}>
              <span
                key={isExecutionExpanded(execution._id)}
                onClick={() => toggleExecution(execution._id)}
              >
                {
                isExecutionExpanded(execution._id) ? (
                  <CollaspedOutlineIcon className="execution-icon" />
                ) : <ExpandOutlineIcon className="execution-icon" />
              }
              </span>
            </FlexboxGrid.Item>
            <FlexboxGrid.Item colspan={22}>
              <div className="execution-test-name" onClick={() => toggleExecution(execution._id)}>
                <span><FormattedMessage id="common.component.suite-table.header.test" /></span>
                <span>: </span>
                <span>{`${execution.title} - `}</span>
                <span className={`execution-status-${execution.status}`}>{`${execution.status}`}</span>
              </div>
              <div className="execution-details-container">
                <span className="date-details">
                  <CalendarIcon />
                  <Moment utc format="DD-MM-YYYY HH:mm:ss">
                    {execution.start}
                  </Moment>
                </span>
                <span>
                  { execution.platforms && execution.platforms.length > 0 ? (
                    <span className="device-details">
                      <DeviceIcon />
                      <span>{getPlatformName(execution)}</span>
                    </span>
                  ) : null }
                </span>
              </div>
            </FlexboxGrid.Item>
            <FlexboxGrid.Item colspan={1}>
              <OverlayTrigger overlay={<Tooltip id="tooltip-disabled"><FormattedMessage id="common.component.suite-table.icon.test-history" /></Tooltip>}>
                <a
                  className="test-history-link"
                  title={<FormattedMessage id="common.component.suite-table.icon.test-history" />}
                  href={`/test-execution-history?executionId=${execution._id}`}
                >
                  <HistoryIcon className="execution-history-icon" />
                </a>
              </OverlayTrigger>
            </FlexboxGrid.Item>
          </FlexboxGrid>
        </div>
      </div>
      { isExecutionExpanded(execution._id) ? (
        <div key={`execution_actions_${index}`} className="actions-row">
          <div className="actions-wrapper">
            { execution.actions.map((action, actionIndex) => [
              <ActionComponent
                key={index}
                action={action}
                index={index}
                screenshots={screenshots}
                openModal={openModal}
                actionIndex={actionIndex}
                execution={execution}
              />,
            ])}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ExecutionTable;
