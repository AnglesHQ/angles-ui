import React from 'react';
import { Breadcrumb, Panel } from 'rsuite';
import TestRunsComparePage from './TestRunsComparePage';

const Page = function (props) {
  const { currentTeam } = props;
  return (
    <Panel>
      <Breadcrumb>
        <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
        <Breadcrumb.Item>Test Run Compare</Breadcrumb.Item>
      </Breadcrumb>
      <TestRunsComparePage currentTeam={currentTeam} />
    </Panel>
  );
};

export default Page;
