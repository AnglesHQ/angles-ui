import React from 'react';
import Table from 'react-bootstrap/Table';
import '../pages/Default.css';

const MetricsTestsTable = function (props) {
  const generateTableRows = () => {
    const { period } = props;
    const tableRows = [];
    period.phases.forEach((phase) => {
      phase.tests.forEach((testName) => {
        tableRows.push(
          <tr>
            <td>{phase.name}</td>
            <td>{testName}</td>
          </tr>,
        );
      });
    });

    if (tableRows.length === 0) {
      tableRows.push(
        <tr>
          <td colSpan={2}>There were no tests for this period.</td>
        </tr>,
      );
    }
    return tableRows;
  };

  return (
    <div className="metrics-test-table-wrapper">
      <Table className="table-test-details" size="sm">
        <thead className="thead-dark">
          <tr>
            <th scope="col">Phase</th>
            <th scope="col">Test</th>
          </tr>
        </thead>
        <tbody>
          {generateTableRows()}
        </tbody>
      </Table>
    </div>
  );
};

export default MetricsTestsTable;
