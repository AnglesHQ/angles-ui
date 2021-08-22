import React, { Component } from 'react';
import moment from 'moment';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import Popover from 'react-bootstrap/Popover';
import { getDurationAsString } from '../../utility/TimeUtilities';
import MetricsTestsTable from './MetricsTestsTable';

class ExecutionMetricsSummary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      //
    };
  }

  getTotalExecutionTime = (period) => {
    let totalTime = 0;
    period.phases.forEach((phase) => {
      const executionTime = phase.executions.reduce((n, { length }) => n + length, 0);
      totalTime += executionTime;
    });
    return getDurationAsString(moment.duration(totalTime));
  }

  getTestCount = (period) => {
    let testCount = 0;
    period.phases.forEach((phase) => {
      testCount += phase.tests.length;
    });
    return testCount;
  }

  getPassRate = (period) => {
    if (period.result.TOTAL > 0) {
      const percentage = ((period.result.PASS / period.result.TOTAL) * 100)
        .toLocaleString(undefined, { maximumFractionDigits: 2 });
      return `${percentage}%`;
    }
    return 'NA';
  }

  render() {
    const { metrics } = this.props;
    const periodRows = [];

    metrics.periods.forEach((period, index) => {
      const popover = (
        <Popover id="popover-basic">
          <Popover.Title as="h3">
            <b>Unique Tests</b>
          </Popover.Title>
          <Popover.Content>
            <MetricsTestsTable period={period} />
          </Popover.Content>
        </Popover>
      );
      periodRows.push(
        <tr key={moment.utc(moment(period.start)).format('DD-MM-YYYY')}>
          <th scope="row">{index + 1}</th>
          <td>{`${moment.utc(moment(period.start)).format('DD-MM-YYYY')} - ${moment.utc(moment(period.end)).format('DD-MM-YYYY')}`}</td>
          <td>
            <span>{this.getTestCount(period)}</span>
            <OverlayTrigger trigger="click" rootClose overlay={popover} placement="right">
              <span className="matrix-info-icon">
                <i className="fas fa-file-alt" />
              </span>
            </OverlayTrigger>
          </td>
          <td>{period.buildCount}</td>
          <td>{period.result.TOTAL}</td>
          <td>{this.getPassRate(period)}</td>
          <td>{this.getTotalExecutionTime(period)}</td>
        </tr>,
      );
    });

    return (
      <table className="table">
        <thead className="thead-dark">
          <tr>
            <th scope="col">#</th>
            <th scope="col">Period</th>
            <th scope="col">
              <span>Number of Tests </span>
              <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">This is a count of all unique test cases (by phase, suite and test name). Hover over the individual icons to see the list of tests.</Tooltip>}>
                <span>
                  <i className="fas fa-info-circle" />
                </span>
              </OverlayTrigger>
            </th>
            <th scope="col">Builds</th>
            <th scope="col">Executions</th>
            <th scope="col">Pass Rate</th>
            <th scope="col">Total Duration</th>
          </tr>
        </thead>
        <tbody>
          {
            periodRows
          }
        </tbody>
      </table>
    );
  }
}

export default ExecutionMetricsSummary;
