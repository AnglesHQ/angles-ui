import React from 'react';
import { Table } from 'rsuite';

const { version } = require('../../../../package.json');

const AboutTable = function (props) {
  const { versions } = props;
  const { Column, HeaderCell, Cell } = Table;

  if (versions) {
    const {
      versions: {
        node: nodeVersion,
        mongo: mongoVersion,
        angles: AnglesBackendVersion,
      },
    } = props;
    const versionsToDisplay = [
      {
        component: 'Node.js',
        version: nodeVersion,
      },
      {
        component: 'MongoDB',
        version: mongoVersion,
      },
      {
        component: 'Angles Backend',
        version: AnglesBackendVersion,
      },
      {
        component: 'Angles Frontend',
        version,
      },
    ];
    return (
      <Table
        data={versionsToDisplay}
        autoHeight
        width={400}
        id="build-artifacts"
        bordered
        hover={false}
      >
        <Column width={200}>
          <HeaderCell>Component</HeaderCell>
          <Cell dataKey="component" />
        </Column>
        <Column width={200}>
          <HeaderCell>Version</HeaderCell>
          <Cell dataKey="version" />
        </Column>
      </Table>
    );
  }
  return null;
};

export default AboutTable;
