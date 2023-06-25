import React, { useContext } from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import HistoryIcon from '@rsuite/icons/History';
import ExpandOutlineIcon from '@rsuite/icons/ExpandOutline';
import CollaspedOutlineIcon from '@rsuite/icons/CollaspedOutline';
import ActionComponent from './ActionComponent';
import ExecutionStateContext from '../../context/ExecutionStateContext';

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
    <>
      <tr key={`execution_${index}`} className="test-row">
        <td colSpan="100%" className={`${execution.status}`}>
          <span key={isExecutionExpanded(execution._id)} className="test-name" onClick={() => toggleExecution(execution._id)}>
            {
              isExecutionExpanded(execution._id) ? (
                <CollaspedOutlineIcon />
              ) : <ExpandOutlineIcon />
            }
            <span>{`Test: ${execution.title} `}</span>
          </span>
          <span>
            { execution.platforms && execution.platforms.length > 0 ? <span className="device-details">{getPlatformName(execution)}</span> : null }
          </span>
          <span className="history-link-execution">
            <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">{`See execution history for ${execution.title}`}</Tooltip>}>
              <span className="d-inline-block">
                <a className="test-history-link" title={`See execution history for ${execution.title}`} href={`/history?executionId=${execution._id}`}>
                  <span>
                    <HistoryIcon />
                  </span>
                </a>
              </span>
            </OverlayTrigger>
          </span>
        </td>
      </tr>
      <tr key={`execution_actions_${index}`} className="actions-row">
        { isExecutionExpanded(execution._id) ? (
          <td colSpan="100%" className="actions-wrapper">
            <table className="actions-table">
              <tbody>
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
              </tbody>
            </table>
          </td>
        ) : null}
      </tr>
    </>
  );
};

export default ExecutionTable;
