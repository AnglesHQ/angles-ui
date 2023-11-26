import React from 'react';
import { Table } from 'rsuite';
import { FormattedMessage } from 'react-intl';

const MetricsTestsTable = function (props) {
  const { Column, HeaderCell, Cell } = Table;

  const generateTableRows = () => {
    const { period } = props;
    const dataArray = [];
    period.phases.forEach((phase) => {
      phase.tests.forEach((testName) => {
        dataArray.push(
          {
            testName,
            phase: phase.name,
          },
        );
      });
    });

    if (dataArray.length === 0) {
      dataArray.push(
        {
          testName: <FormattedMessage id="page.metrics.metrics-test-table.no-tests-found" />,
        },
      );
    }
    return dataArray;
  };

  return (
    <Table
      data={generateTableRows()}
      hover={false}
      autoHeight
    >
      <Column flexGrow={1}>
        <HeaderCell>
          <FormattedMessage id="page.metrics.metrics-test-table.label.phase" />
        </HeaderCell>
        <Cell dataKey="phase" />
      </Column>
      <Column flexGrow={5}>
        <HeaderCell>
          <FormattedMessage id="page.metrics.metrics-test-table.label.test" />
        </HeaderCell>
        <Cell dataKey="testName" />
      </Column>
    </Table>
  );
};

export default MetricsTestsTable;
