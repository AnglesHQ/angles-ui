import React, { Component } from 'react';
import Table from 'react-bootstrap/Table';
import '../pages/Default.css';

class MetricsTestsTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    const { period } = this.props;
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
            {tableRows}
          </tbody>
        </Table>
      </div>
    );
  }
}

export default MetricsTestsTable;
