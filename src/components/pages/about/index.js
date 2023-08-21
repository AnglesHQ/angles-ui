import React from 'react';
import { Breadcrumb, Panel } from 'rsuite';
import AboutPage from './AboutPage';
import AboutTable from './AboutTable';

const Page = function () {
  return (
    <Panel>
      <Breadcrumb>
        <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
        <Breadcrumb.Item>About</Breadcrumb.Item>
      </Breadcrumb>
      <AboutPage />
      <AboutTable />
    </Panel>
  );
};

export default Page;
