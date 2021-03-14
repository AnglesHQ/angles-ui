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
    /* eslint consistent-return: [0] */
    const failingActions = execution.actions.filter((action) => action.status === status);
    if (failingActions.length > 0) {
      const failingSteps = failingActions[0].steps.filter((step) => step.status === status);
      if (failingSteps.length > 0) {
        const step = failingSteps[0];
        if (step.info !== '') {
          return step.info;
        }
        return step.name;
      }
    }
    return '';
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
              execution.platforms.map((platform) => (
                <tr key={`platform_${platform.platformName}`}>
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
               <div className="test-details-error">
                 <td>
                   {
                      this.getFirstTestStepByStatus(execution, execution.status)
                   }
                 </td>
               </div>
             </tr>
           ) : null
         }
        </tbody>
      </Table>
    );
  }
}

export default TestDetailsTable;
