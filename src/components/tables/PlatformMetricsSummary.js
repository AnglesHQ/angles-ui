import React, { Component } from 'react';
import moment from 'moment';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

class PlatformMetricsSummary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      //
    };
  }

  render() {
    const { metrics } = this.props;
    const periodRows = [];
    const periods = [...metrics.periods];
    periods.forEach((period, index) => {
      periodRows.push(
        <tr key={moment.utc(moment(period.start)).format('DD-MM-YYYY')}>
          <th scope="row">{index + 1}</th>
          <td>{`${moment.utc(moment(period.start)).format('DD-MM-YYYY')} - ${moment.utc(moment(period.end)).format('DD-MM-YYYY')}`}</td>
          <td>
            <span>blah</span>
          </td>
          <td>{period.buildCount}</td>
          <td>{period.result.TOTAL}</td>
          <td>blah</td>
          <td>blah</td>
        </tr>,
      );
    });

    return (
      <div className="metrics-table-wrapper">
        <table className="table">
          <thead className="thead-dark metrics-table-head">
            <tr>
              <th scope="col">#</th>
              <th scope="col">Device</th>
              <th scope="col">
                <span>Number of Tests </span>
                <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">This is a count of all unique test cases (by phase, suite and test name). Click on the individual icons to see the list of tests.</Tooltip>}>
                  <span>
                    <i className="fas fa-info-circle" />
                  </span>
                </OverlayTrigger>
              </th>
              <th scope="col">Builds</th>
              <th scope="col">Executions</th>
              <th scope="col">Pass Rate</th>
              <th scope="col">
                <span>Total Duration </span>
                <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">This is the total amount of time of all the tests combined (if tests were run in parallel, this will differ from the total build time)</Tooltip>}>
                  <span>
                    <i className="fas fa-info-circle" />
                  </span>
                </OverlayTrigger>
              </th>
            </tr>
          </thead>
          <tbody className="metrics-table-body">
            {
              periodRows
            }
          </tbody>
        </table>
      </div>
    );
  }
}

export default PlatformMetricsSummary;
