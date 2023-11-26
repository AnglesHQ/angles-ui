import React from 'react';
import { Table } from 'rsuite';

const MetricsTestsTable = function (props) {
  const { Column, HeaderCell, Cell } = Table;

  const generateTestResultsArray = () => {
    const { result } = props;
    const dataArray = [];
    Object.keys((result)).forEach((key) => {
      dataArray.push(
        {
          value: key,
          result: result[key],
        },
      );
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
      data={generateTestResultsArray()}
      hover={false}
      autoHeight
    >
      <Column flexGrow={1}>
        <HeaderCell>Value</HeaderCell>
        <Cell dataKey="value" />
      </Column>
      <Column flexGrow={1}>
        <HeaderCell>Result</HeaderCell>
        <Cell dataKey="result" />
      </Column>
    </Table>
  );
};

export default MetricsTestsTable;
