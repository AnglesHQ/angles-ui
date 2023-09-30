import React from 'react';
import moment from 'moment';
import { FormattedMessage } from 'react-intl';
import InfoOutlineIcon from '@rsuite/icons/InfoOutline';
import { Table, Whisper, Popover } from 'rsuite';
import { getDurationAsString } from '../../../utility/TimeUtilities';
import MetricsTestsTable from './MetricsTestsTable';
import ExecutionsResultsBar from '../../common/ExecutionsResultsBar';

const { Column, HeaderCell, Cell } = Table;

const getTestCount = (period) => {
  let testCount = 0;
  period.phases.forEach((phase) => {
    testCount += phase.tests.length;
  });
  return testCount;
};

const testDetailsSpeaker = (period) => (
  <Popover arrow style={{ maxHeight: '300px', overflowY: 'scroll' }}>
    <div>
      <MetricsTestsTable period={period} />
    </div>
  </Popover>
);

const UniqueTestsCell = function (props) {
  const { rowData: period } = props;
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <Cell {... props}>
      { getTestCount(period) }
      <Whisper
        placement="rightStart"
        trigger="click"
        controlId="control-id-click"
        speaker={testDetailsSpeaker(period)}
      >
        <InfoOutlineIcon />
      </Whisper>
    </Cell>
  );
};

const ExecutionMetricsSummary = function (props) {
  const { metrics } = props;
  const periods = [...metrics.periods].reverse();
  const getTotalExecutionTime = (period) => {
    let totalTime = 0;
    period.phases.forEach((phase) => {
      const executionTime = phase.executions.reduce((n, { length }) => n + length, 0);
      totalTime += executionTime;
    });
    return getDurationAsString(moment.duration(totalTime));
  };

  return (
    <div className="metrics-table-wrapper">
      <Table
        data={periods}
        autoHeight
        id="build-artifacts"
        hover={false}
        bordered
      >
        <Column width={200}>
          <HeaderCell>
            <FormattedMessage id="page.metrics.execution-metrics-summary.label.period" />
          </HeaderCell>
          <Cell>
            {
              (rowData) => `${moment.utc(moment(rowData.start)).format('DD-MM-YYYY')} - ${moment.utc(moment(rowData.end)).format('DD-MM-YYYY')}`
            }
          </Cell>
        </Column>
        <Column flexGrow={2}>
          <HeaderCell>
            <FormattedMessage id="page.metrics.execution-metrics-summary.label.number-of-tests" />
          </HeaderCell>
          <UniqueTestsCell />
        </Column>
        <Column flexGrow={2}>
          <HeaderCell>
            <FormattedMessage id="page.metrics.execution-metrics-summary.label.number-of-runs" />
          </HeaderCell>
          <Cell dataKey="buildCount" />
        </Column>
        <Column flexGrow={2}>
          <HeaderCell>
            <FormattedMessage id="page.metrics.execution-metrics-summary.label.number-of-executions" />
          </HeaderCell>
          <Cell dataKey="result.TOTAL" />
        </Column>
        <Column flexGrow={3}>
          <HeaderCell>
            <FormattedMessage id="page.metrics.execution-metrics-summary.label.result" />
          </HeaderCell>
          <Cell>
            {
              (rowData) => <ExecutionsResultsBar result={rowData.result} />
            }
          </Cell>
        </Column>
        <Column flexGrow={2}>
          <HeaderCell>
            <FormattedMessage id="page.metrics.execution-metrics-summary.label.duration" />
          </HeaderCell>
          <Cell>
            {
              (rowData) => getTotalExecutionTime(rowData)
            }
          </Cell>
        </Column>
      </Table>
    </div>
  );
};

export default ExecutionMetricsSummary;
