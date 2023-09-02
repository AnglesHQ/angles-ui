import React from 'react';
import { Breadcrumb, Panel } from 'rsuite';
import ScreenshotLibraryPage from './ScreenshotLibraryPage';

const Page = function () {
  return (
    <Panel>
      <Breadcrumb>
        <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
        <Breadcrumb.Item>Screenshot Library</Breadcrumb.Item>
      </Breadcrumb>
      <ScreenshotLibraryPage />
    </Panel>
  );
};

export default Page;
