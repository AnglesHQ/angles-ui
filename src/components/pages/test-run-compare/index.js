import React from 'react';
import { Panel } from 'rsuite';
import TestRunsComparePage from './TestRunsComparePage';

const Page = function (props) {
  const { currentTeam } = props;
  return (
    <Panel header={<h3 className="title">Test Runs Compare</h3>}>
      <TestRunsComparePage currentTeam={currentTeam} />
    </Panel>
  );
};

export default Page;
