import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Breadcrumb, Panel } from 'rsuite';
import NotFoundPage from './NotFoundPage';

const Page = function () {
  return (
    <Panel>
      <Breadcrumb>
        <Breadcrumb.Item href="/">
          <FormattedMessage id="page.home.bread-crumb" />
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <FormattedMessage id="page.not-found.bread-crumb" />
        </Breadcrumb.Item>
      </Breadcrumb>
      <NotFoundPage />
    </Panel>
  );
};

export default Page;
