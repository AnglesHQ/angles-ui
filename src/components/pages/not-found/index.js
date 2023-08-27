import React from 'react';
import { Breadcrumb, Panel } from 'rsuite';
import NotFoundPage from './NotFoundPage';

const Page = function () {
  return (
    <Panel>
      <Breadcrumb>
        <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
        <Breadcrumb.Item>Not Found</Breadcrumb.Item>
      </Breadcrumb>
      <NotFoundPage />
    </Panel>
  );
};

export default Page;
