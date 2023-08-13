import React from 'react';
import Table from 'react-bootstrap/Table';

const { version } = require('../../../../package.json');

const AboutTable = function (props) {
  const { versions } = props;
  if (versions) {
    return (
      <Table className="about-versions-table" size="sm">
        <thead>
          <tr className="thead-dark">
            <th scope="col">Component</th>
            <th scope="col">Version</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Angles Frontend</td>
            <td>{version}</td>
          </tr>
          <tr>
            <td>Angles Backend</td>
            <td>{versions.angles}</td>
          </tr>
          <tr>
            <td>Node</td>
            <td>{versions.node}</td>
          </tr>
          <tr>
            <td>Mongo</td>
            <td>{versions.mongo}</td>
          </tr>
        </tbody>
      </Table>
    );
  }
  return null;
};

export default AboutTable;
