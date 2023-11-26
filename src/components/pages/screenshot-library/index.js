import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Breadcrumb, Panel } from 'rsuite';
import ScreenshotLibraryPage from './ScreenshotLibraryPage';

const Page = function () {
  return (
    <Panel>
      <Breadcrumb>
        <Breadcrumb.Item href="/">
          <FormattedMessage id="page.home.bread-crumb" />
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <FormattedMessage id="page.screenshot-library.bread-crumb" />
        </Breadcrumb.Item>
      </Breadcrumb>
      <ScreenshotLibraryPage />
    </Panel>
  );
};

export default Page;
