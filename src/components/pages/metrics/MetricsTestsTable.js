import React from 'react';
import { Table } from 'rsuite';

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
          testName: 'No tests found',
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
        <HeaderCell>Phase</HeaderCell>
        <Cell dataKey="phase" />
      </Column>
      <Column flexGrow={5}>
        <HeaderCell>Test</HeaderCell>
        <Cell dataKey="testName" />
      </Column>
    </Table>
  );
};

export default MetricsTestsTable;
