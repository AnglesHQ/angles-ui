import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Breadcrumb, Panel } from 'rsuite';
import AboutPage from './AboutPage';
import AboutTable from './AboutTable';

const Page = function () {
  return (
    <Panel>
      <Breadcrumb>
        <Breadcrumb.Item href="/">
          <FormattedMessage id="page.home.bread-crumb" />
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <FormattedMessage id="page.about.bread-crumb" />
        </Breadcrumb.Item>
      </Breadcrumb>
      <AboutPage />
      <AboutTable />
    </Panel>
  );
};

export default Page;
