import React from 'react';
import { Panel } from 'rsuite';
import MetricsPage from './MetricsPage';

const Page = function () {
  return (
    <Panel header={<h3 className="title">Metrics</h3>}>
      <MetricsPage />
    </Panel>
  );
};

export default Page;
