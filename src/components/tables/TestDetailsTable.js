import React, { Component } from 'react'
import Table from 'react-bootstrap/Table'
import '../pages/Default.css'
import {getDuration} from '../../utility/TimeUtilities'

class TestDetailsTable extends Component {

  constructor(props) {
    super(props);
    this.state = {
    };
  }

  getFirstTestStepByStatus = (execution, status, callback) => {
    for (var i = 0; i < execution.actions.length; i++) {
      for (var j = 0; j < execution.actions[i].steps.length; j++) {
        if (execution.actions[i].steps[j].status === status) {
          let step = execution.actions[i].steps[j];
          if (step.info) {
            return step.info;
          } else {
            return step.name;
          }
        }
      }
    }
  }

  render () {
    return <Table className="table-test-details" size="sm">
      <tbody>
        <tr className={this.props.execution.status}>
          <td ><strong>Status</strong></td>
          <td>{ this.props.execution.status }</td>
        </tr>
        <tr>
          <td><strong>Duration</strong></td>
          <td>
            { getDuration(this.props.execution) }
          </td>
        </tr>
        {
          this.props.execution.platforms && this.props.execution.platforms.length > 0 ? (
            this.props.execution.platforms.map((platform, index) => {
              return <tr key={`platform_${index}`}>
                  <td><strong>Platform</strong></td>
                  <td>
                    {
                      platform.deviceName ? (
                        `${platform.deviceName} (${platform.platformName})`
                      ) :
                       `${platform.browserName} ${platform.browserVersion}  (${platform.platformName})`
                    }
                  </td>
                </tr>
            })
          ) : null
        }
       {
         this.props.execution.status === "ERROR" || this.props.execution.status === "FAIL" ? (
           <tr>
            <td><strong>Failing Step</strong></td>
            <td>
            {
                this.getFirstTestStepByStatus(this.props.execution, this.props.execution.status)
            }
            </td>
           </tr>
         ) : null
       }
      </tbody>
    </Table>
  }
};

export default TestDetailsTable
