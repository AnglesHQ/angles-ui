import React from 'react';
import { Panel } from 'rsuite';
import ScreenshotLibraryPage from './ScreenshotLibraryPage';

const Page = function () {
  return (
    <Panel header={<h3 className="title">Screenshot Library</h3>}>
      <ScreenshotLibraryPage />
    </Panel>
  );
};

export default Page;
