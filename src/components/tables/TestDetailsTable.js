import React, { Component } from 'react';
import Table from 'react-bootstrap/Table';
import '../pages/Default.css';
import { getDuration } from '../../utility/TimeUtilities';

class TestDetailsTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  getFirstTestStepByStatus = (execution, status) => {
    execution.actions.forEach((action) => {
      action.steps.forEach((step) => {
        if (step.status === status) {
          if (step.info) {
            return step.info;
          }
          return step.name;
        }
      });
    });
  }

  render() {
    const { execution } = this.props;
    return (
      <Table className="table-test-details" size="sm">
        <tbody>
          <tr className={execution.status}>
            <td><strong>Status</strong></td>
            <td>{execution.status}</td>
          </tr>
          <tr>
            <td><strong>Duration</strong></td>
            <td>
              { getDuration(execution) }
            </td>
          </tr>
          {
            execution.platforms && execution.platforms.length > 0 ? (
              execution.platforms.map((platform, index) => (
                <tr key={`platform_${index}`}>
                  <td><strong>Platform</strong></td>
                  <td>
                    {
                      platform.deviceName ? (
                        `${platform.deviceName} (${platform.platformName})`
                      )
                        : `${platform.browserName} ${platform.browserVersion} (${platform.platformName})`
                    }
                  </td>
                </tr>
              ))
            ) : null
          }
          {
           execution.status === 'ERROR' || execution.status === 'FAIL' ? (
             <tr>
               <td><strong>Failing Step</strong></td>
               <td>
                 {
                    this.getFirstTestStepByStatus(execution, execution.status)
                }
               </td>
             </tr>
           ) : null
         }
        </tbody>
      </Table>
    );
  }
}

export default TestDetailsTable;
