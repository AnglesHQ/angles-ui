import React from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import ActionComponent from './ActionComponent';

const ExecutionTable = function (props) {
  let { executionState } = props;
  const {
    index,
    execution,
    screenshots,
    openModal,
    toggleExecution,
    toggleAction,
  } = props;
  if (!executionState) {
    executionState = { isOpen: false };
  }

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

  return [
    <tr key={`execution_${index}`} className="test-row">
      <td colSpan="100%" className={`${execution.status}`}>
        <span key={executionState.isOpen} className="test-name" onClick={() => toggleExecution(execution._id)}>
          <i title="Click to display/hide test steps" className={executionState.isOpen ? ('fa fa-caret-down') : 'fas fa-caret-right'} />
          <span>{`Test: ${execution.title} `}</span>
        </span>
        <span>
          { execution.platforms && execution.platforms.length > 0 ? <span className="device-details">{getPlatformName(execution)}</span> : null }
        </span>
        <span className="history-link-execution">
          <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">{`See execution history for ${execution.title}`}</Tooltip>}>
            <span className="d-inline-block">
              <a className="test-history-link" title={`See execution history for ${execution.title}`} href={`/history?executionId=${execution._id}`}>
                <span><i className="fa fa-history" aria-hidden="true">history</i></span>
              </a>
            </span>
          </OverlayTrigger>
        </span>
      </td>
    </tr>,
    <tr key={`execution_actions_${index}`} className="actions-row">
      { executionState.isOpen ? (
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
                  toggleAction={toggleAction}
                  actionIndex={actionIndex}
                  isOpen={executionState.actions[actionIndex]}
                />,
              ])}
            </tbody>
          </table>
        </td>
      ) : null}
    </tr>,
  ];
};

export default ExecutionTable;
