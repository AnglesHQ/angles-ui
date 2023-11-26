import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Breadcrumb, Panel } from 'rsuite';
import TestRunsComparePage from './TestRunsComparePage';

const Page = function (props) {
  const { currentTeam } = props;
  return (
    <Panel>
      <Breadcrumb>
        <Breadcrumb.Item href="/">
          <FormattedMessage id="page.home.bread-crumb" />
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <FormattedMessage id="page.test-run-compare.bread-crumb" />
        </Breadcrumb.Item>
      </Breadcrumb>
      <TestRunsComparePage currentTeam={currentTeam} />
    </Panel>
  );
};

export default Page;
