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
      >
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
    )
  );
};

export default BuildArtifacts;
