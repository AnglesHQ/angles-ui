import React from 'react';
import { Panel } from 'rsuite';
import TestRunDetailsPage from './TestRunDetailsPage';

const Page = function () {
  return (
    <Panel header={<h3 className="title">Test Run Details</h3>}>
      <TestRunDetailsPage />
    </Panel>
  );
};

export default Page;
