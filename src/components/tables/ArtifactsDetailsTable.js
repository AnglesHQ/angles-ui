import React from 'react';
import Table from 'react-bootstrap/Table';
// import '../pages/Default.css';

const ArtifactsDetailsTable = function (props) {
  const { artifacts } = props;
  const tableRows = [];
  artifacts.forEach((artifact) => {
    tableRows.push(
      <tr>
        <td>{artifact.groupId}</td>
        <td>{artifact.artifactId}</td>
        <td>{artifact.version}</td>
      </tr>,
    );
  });

  if (tableRows.length === 0) {
    tableRows.push(
      <tr>
        <td colSpan={3}>There were no artifacts stored for this build.</td>
      </tr>,
    );
  }

  return (
    <div className="metrics-test-table-wrapper">
      <Table className="table-test-details" size="sm">
        <thead className="thead-dark">
          <tr>
            <th scope="col">GroupId</th>
            <th scope="col">ArtifactId</th>
            <th scope="col">Version</th>
          </tr>
        </thead>
        <tbody>
          {tableRows}
        </tbody>
      </Table>
    </div>
  );
};

export default ArtifactsDetailsTable;
