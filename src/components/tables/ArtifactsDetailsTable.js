import React from 'react';
import {
  Table,
} from 'rsuite';

const ArtifactsDetailsTable = function (props) {
  const { artifacts } = props;
  const { Column, HeaderCell, Cell } = Table;

  return (
    <Table data={artifacts} id="artifact-details-table" style={{ display: 'block' }}>
      <Column>
        <HeaderCell>Group Id</HeaderCell>
        <Cell dataKey="groupId" />
      </Column>
      <Column>
        <HeaderCell>Artifact Id</HeaderCell>
        <Cell dataKey="artifactId" />
      </Column>
      <Column>
        <HeaderCell>Version</HeaderCell>
        <Cell dataKey="version" />
      </Column>
    </Table>
  );
};

export default ArtifactsDetailsTable;
