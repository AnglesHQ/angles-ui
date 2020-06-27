import React, { Component } from 'react'
import timeUtility from '../../utility/TimeUtilities'
import Moment from 'react-moment';
import moment from 'moment'

class ExecutionTable extends Component {

  constructor(props) {
    super(props);
    console.log(props);
    this.state = {
      open: false
    };
      //this.calculateMetricsForBuilds(props.builds);
      this.toggleActions = this.toggleActions.bind(this);
  }

  toggleActions(e){
    this.setState({open: !this.state.open})
  }

  render () {
    return [
      <tr key={"execution_" + this.props.index} className="test-row" onClick={(e)=>this.toggleActions(e)} >
        <td colSpan="100%" className={`${this.props.execution.status}`}>
          { this.state.open ? (
              <i class="fa fa-caret-down" aria-hidden="true"></i>
          ) : <i class="fa fa-caret-right" aria-hidden="true"></i> }
          <span>Test: {this.props.execution.title}</span>
        </td>
      </tr>,
      <tr key={"execution_actions_" + this.props.index} className="actions-row">
      { this.state.open ? (
          <td colSpan="100%" className="actions-wrapper">
            <table className="actions-table">
              <tbody>
                { this.props.execution.actions.map((action, index) => {
                  return [<tr key={"action_" + index} className="action-description">
                    <td className={`${action.status}`} colSpan="100%">{action.name}</td>
                  </tr>,
                  <tr key={"steps_" + index}>
                    <td className="action-steps">
                      <table className="steps-table">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Time</th>
                            <th>Status</th>
                            <th width="25%">Step</th>
                            <th>Expected</th>
                            <th>Actual</th>
                            <th width="30%">Info</th>
                          </tr>
                        </thead>
                        <tbody>
                          { action.steps.map((step, index) => {
                            return <tr key={"step_" + index}>
                              <td>{index+1}</td>
                              <td>
                                <Moment format="HH:mm:ss">
                                  {step.time}
                                </Moment>
                              </td>
                              <td className={`${step.status}`}>{step.status}</td>
                              <td>{step.name}</td>
                              <td>{step.expected}</td>
                              <td>{step.actual}</td>
                              <td>{step.info}</td>
                            </tr>
                            })
                          }
                        </tbody>
                      </table>
                    </td>
                  </tr>
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

export default ExecutionTable
