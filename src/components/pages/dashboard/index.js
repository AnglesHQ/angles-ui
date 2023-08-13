import React from 'react';
import { Panel } from 'rsuite';
import DashboardPage from './DashboardPage';

const Page = function () {
  return (
    <Panel header={<h3 className="title">Dashboard</h3>}>
      <DashboardPage />
    </Panel>
  );
};

export default Page;
