import React from 'react';
import moment from 'moment';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import Popover from 'react-bootstrap/Popover';
import { getDurationAsString } from '../../utility/TimeUtilities';
import MetricsTestsTable from './MetricsTestsTable';

const ExecutionMetricsSummary = function (props) {
  const getTotalExecutionTime = (period) => {
    let totalTime = 0;
    period.phases.forEach((phase) => {
      const executionTime = phase.executions.reduce((n, { length }) => n + length, 0);
      totalTime += executionTime;
    });
    return getDurationAsString(moment.duration(totalTime));
  };

  const getTestCount = (period) => {
    let testCount = 0;
    period.phases.forEach((phase) => {
      testCount += phase.tests.length;
    });
    return testCount;
  };

  const getPassRate = (period) => {
    if (period.result.TOTAL > 0) {
      const percentage = ((period.result.PASS / period.result.TOTAL) * 100)
        .toLocaleString(undefined, { maximumFractionDigits: 2 });
      return `${percentage}%`;
    }
    return 'NA';
  };

  const generatePeriodRows = () => {
    const { metrics } = props;
    const periodRows = [];
    const periods = [...metrics.periods];
    periods.reverse().forEach((period, index) => {
      const popover = (
        <Popover id="popover-basic">
          <Popover.Header as="h3">
            <b>Unique Tests</b>
          </Popover.Header>
          <Popover.Body>
            <MetricsTestsTable period={period} />
          </Popover.Body>
        </Popover>
      );
      periodRows.push(
        <tr key={moment.utc(moment(period.start)).format('DD-MM-YYYY')}>
          <th scope="row">{index + 1}</th>
          <td>{`${moment.utc(moment(period.start)).format('DD-MM-YYYY')} - ${moment.utc(moment(period.end)).format('DD-MM-YYYY')}`}</td>
          <td>
            <span>{getTestCount(period)}</span>
            <OverlayTrigger trigger="click" rootClose overlay={popover} placement="right">
              <span className="matrix-info-icon">
                <i className="fas fa-file-alt" />
              </span>
            </OverlayTrigger>
          </td>
          <td>{period.buildCount}</td>
          <td>{period.result.TOTAL}</td>
          <td>{getPassRate(period)}</td>
          <td>{getTotalExecutionTime(period)}</td>
        </tr>,
      );
    });
    return periodRows;
  };

  return (
    <div className="metrics-table-wrapper">
      <table className="table fixed-header">
        <thead className="thead-dark metrics-table-head">
          <tr>
            <th scope="col">#</th>
            <th scope="col">Period</th>
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
            generatePeriodRows()
          }
        </tbody>
      </table>
    </div>
  );
};

export default ExecutionMetricsSummary;
