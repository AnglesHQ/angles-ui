import React from 'react';
import { Panel } from 'rsuite';
import BuildPage from './BuildPage';

const Page = function () {
  return (
    <Panel header={<h3 className="title">Build</h3>}>
      <BuildPage />
    </Panel>
  );
};

export default Page;
