import React from 'react';
import {
  Table,
} from 'rsuite';

const BuildArtifacts = function (props) {
  const { build: { artifacts } } = props;
  const { Column, HeaderCell, Cell } = Table;

  return (
    (!artifacts || artifacts.length === 0) ? null : (
      <Table
        data={artifacts}
        id="build-artifacts"
        hover={false}
        className="build-artifacts-table"
      >
        <Column flexGrow={3}>
          <HeaderCell>Group Id</HeaderCell>
          <Cell dataKey="groupId" />
        </Column>
        <Column flexGrow={4}>
          <HeaderCell>Artifact Id</HeaderCell>
          <Cell dataKey="artifactId" />
        </Column>
        <Column flexGrow={3}>
          <HeaderCell>Version</HeaderCell>
          <Cell dataKey="version" />
        </Column>
      </Table>
    )
  );
};

export default BuildArtifacts;
