import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Breadcrumb, Panel } from 'rsuite';
import TestRunDetailsPage from './TestRunDetailsPage';

const Page = function () {
  return (
    <Panel>
      <Breadcrumb>
        <Breadcrumb.Item href="/">
          <FormattedMessage id="page.home.bread-crumb" />
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <FormattedMessage id="page.test-run.bread-crumb" />
        </Breadcrumb.Item>
      </Breadcrumb>
      <TestRunDetailsPage />
    </Panel>
  );
};

export default Page;
