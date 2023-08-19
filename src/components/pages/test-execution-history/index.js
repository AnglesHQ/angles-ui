import React from 'react';
import { Panel } from 'rsuite';
import ExecutionHistoryPage from './ExecutionHistoryPage';

const Page = function (props) {
  return (
    <Panel header={<h3 className="title">Test Execution History</h3>}>
      <ExecutionHistoryPage />
    </Panel>
  );
};

export default Page;
