import React from 'react';
import { Breadcrumb, Panel } from 'rsuite';
import TestRunDetailsPage from './TestRunDetailsPage';

const Page = function () {
  return (
    <Panel>
      <Breadcrumb>
        <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
        <Breadcrumb.Item>Test Run</Breadcrumb.Item>
      </Breadcrumb>
      <TestRunDetailsPage />
    </Panel>
  );
};

export default Page;
