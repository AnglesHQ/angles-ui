import React from 'react';
import { Breadcrumb, Panel } from 'rsuite';
import { FormattedMessage } from 'react-intl';
import ExecutionHistoryPage from './ExecutionHistoryPage';

const Page = function () {
  return (
    <Panel>
      <Breadcrumb>
        <Breadcrumb.Item href="/">
          <FormattedMessage id="page.home.bread-crumb" />
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <FormattedMessage id="page.test-execution-history.bread-crumb" />
        </Breadcrumb.Item>
      </Breadcrumb>
      <ExecutionHistoryPage />
    </Panel>
  );
};

export default Page;
