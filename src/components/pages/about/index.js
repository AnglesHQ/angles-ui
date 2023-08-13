import React from 'react';
import { Panel } from 'rsuite';
import AboutPage from './AboutPage';
import AboutTable from './AboutTable';

const Page = function () {
  return (
    <Panel header={<h3 className="title">About Angles</h3>}>
      <AboutPage />
      <AboutTable />
    </Panel>
  );
};

export default Page;
