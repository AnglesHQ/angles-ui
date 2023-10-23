import React from 'react';
import { Breadcrumb, Panel } from 'rsuite';
import ExecutionHistoryPage from './ExecutionHistoryPage';

const Page = function () {
  return (
    <Panel header={<h3 className="title">Test Execution History</h3>}>
      <Breadcrumb>
        <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
        <Breadcrumb.Item>Test Execution History</Breadcrumb.Item>
      </Breadcrumb>
      <ExecutionHistoryPage />
    </Panel>
  );
};

export default Page;
