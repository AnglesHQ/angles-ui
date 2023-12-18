import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Breadcrumb, Panel } from 'rsuite';
import IntroductionPage from './IntroductionPage';

const Page = function () {
  return (
    <Panel>
      <Breadcrumb>
        <Breadcrumb.Item href="/">
          <FormattedMessage id="page.home.bread-crumb" />
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <FormattedMessage id="page.introduction.bread-crumb" />
        </Breadcrumb.Item>
      </Breadcrumb>
      <IntroductionPage />
    </Panel>
  );
};

export default Page;
