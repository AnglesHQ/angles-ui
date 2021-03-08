import React, { Component } from 'react';
import Moment from 'react-moment';
import ActionComponent from './ActionComponent';

class HistoryExecutionTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
    };
    // this.calculateMetricsForBuilds(props.builds);
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
      <tr key={`execution_${index}`} className="test-row" onClick={(e) => this.toggleActions(e)}>
        <td colSpan="100%" className={`${execution.status}`}>
          <span key={open}>
            <i title="Click to display/hide test steps" className={open ? ('fa fa-caret-down') : 'fas fa-caret-right'} />
          </span>
          <span><Moment format="DD-MM-YYYY HH:mm">{execution.start}</Moment></span>
          { execution.platforms && execution.platforms.length > 0 ? <span className="device-details">{this.getPlatformName(execution)}</span> : null }
        </td>
      </tr>,
      <tr key={`execution_actions_${index}`} className="actions-row">
        { open ? (
          <td colSpan="100%" className="actions-wrapper">
            <table className="actions-table">
              <tbody>
                { execution.actions.map((action) => [
                  <ActionComponent key={`action_${index}`} action={action} screenshots={screenshots} index={index} openModal={openModal} />,
                ])}
              </tbody>
            </table>
          </td>
        ) : null}
      </tr>,
    ];
  }
}

export default HistoryExecutionTable;
