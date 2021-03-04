import React, { Component } from 'react';
import OverlayTrigger from 'react-bootstrap//OverlayTrigger';
import Tooltip from 'react-bootstrap//Tooltip';
import ActionComponent from './ActionComponent';

class ExecutionTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
    };
    this.toggleActions = this.toggleActions.bind(this);
  }

  toggleActions = () => {
    const { open } = this.state;
    this.setState({ open: !open });
  }

  getPlatformName = (execution) => {
    const platformsToDisplay = [];
    if (execution.platforms) {
      execution.platforms.forEach((platform) => {
        if (platform.deviceName) {
          platformsToDisplay.push(`${platform.deviceName} [${platform.platformName}${platform.platformVersion ? platform.platformVersion : null}]`);
        } else {
          platformsToDisplay.push(`${platform.browserName}${platform.browserVersion ? ` - ${platform.browserVersion}` : null} [${platform.platformName}]`);
        }
      });
    }
    return platformsToDisplay.join(', ');
  }

  render() {
    const {
      index,
      execution,
      screenshots,
      openModal,
    } = this.props;
    const { open } = this.state;
    return [
      <tr key={`execution_${index}`} className="test-row">
        <td colSpan="100%" className={`${execution.status}`}>
          <span key={open} className="test-name" onClick={(e)=>this.toggleActions(e)}>
            <i title="Click to display/hide test steps" className={open ? ('fa fa-caret-down') : 'fas fa-caret-right'} />
            <span>{`Test: ${execution.title} `}</span>
          </span>
          <span>
            { execution.platforms && execution.platforms.length > 0 ? <span className="device-details">{this.getPlatformName(execution)}</span> : null }
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
        { open ? (
          <td colSpan="100%" className="actions-wrapper">
            <table className="actions-table">
              <tbody>
                { execution.actions.map((action) => [
                  <ActionComponent key={`action_${index}`} action={action} index={index} screenshots={screenshots} openModal={openModal} />,
                ])}
              </tbody>
            </table>
          </td>
        ) : null}
      </tr>,
    ];
  }
}

export default ExecutionTable;
