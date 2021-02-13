import React, { Component } from 'react'
import Moment from 'react-moment';
import ActionComponent from './ActionComponent';

class HistoryExecutionTable extends Component {

  constructor(props) {
    super(props);
    this.state = {
      open: false
    };
      //this.calculateMetricsForBuilds(props.builds);
      this.toggleActions = this.toggleActions.bind(this);
  }

  toggleActions = (e) => {
    this.setState({open: !this.state.open})
  }

  getPlatformName = (execution) => {
    let platformsToDisplay = [];
    if (execution.platforms) {
      execution.platforms.forEach((platform) => {
        if (platform.deviceName) {
          platformsToDisplay.push(`${platform.deviceName} [${platform.platformName}${platform.platformVersion ? platform.platformVersion: null }]`);
        } else {
          platformsToDisplay.push(`${platform.browserName}${platform.browserVersion ? ' - ' + platform.browserVersion: null } [${platform.platformName}]`);
        }
      })
    }
    return platformsToDisplay.join(', ');
  }

  render () {
    return [
      <tr key={"execution_" + this.props.index} className="test-row" onClick={(e)=>this.toggleActions(e)} >
        <td colSpan="100%" className={`${this.props.execution.status}`}>
          <span key={ this.state.open }>
            <i title="Click to display/hide test steps" className={ this.state.open ? ('fa fa-caret-down'): 'fas fa-caret-right' }></i>
          </span>
          <span><Moment format="DD-MM-YYYY HH:mm">{this.props.execution.start}</Moment></span>
          { this.props.execution.platforms && this.props.execution.platforms.length > 0 ? <span className="device-details">{this.getPlatformName(this.props.execution)}</span> : null }
        </td>
      </tr>,
      <tr key={"execution_actions_" + this.props.index} className="actions-row">
      { this.state.open ? (
          <td colSpan="100%" className="actions-wrapper">
            <table className="actions-table">
              <tbody>
                { this.props.execution.actions.map((action, index) => {
                  return [
                    <ActionComponent key={"action_" + index} action={action} screenshots={this.props.screenshots} index={index} openModal={this.props.openModal} />
                  ]
                })
              }
              </tbody>
            </table>
          </td>
      ) : null}
      </tr>
    ]
  }
};

export default HistoryExecutionTable;
