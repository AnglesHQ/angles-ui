import React from 'react';
import { Breadcrumb, Panel } from 'rsuite';
import ExecutionHistoryPage from './ExecutionHistoryPage';

const Page = function () {
  return (
    <Panel>
      <Breadcrumb>
        <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
        <Breadcrumb.Item>Test Execution History</Breadcrumb.Item>
      </Breadcrumb>
      <ExecutionHistoryPage />
    </Panel>
  );
};

export default Page;
