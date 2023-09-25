import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Breadcrumb, Panel } from 'rsuite';
import MetricsPage from './MetricsPage';

const Page = function (props) {
  const { teams, currentTeam, changeCurrentTeam } = props;
  return (
    <Panel>
      <Breadcrumb>
        <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
        <Breadcrumb.Item>
          <FormattedMessage id="page.metrics.bread-crumb" />
        </Breadcrumb.Item>
      </Breadcrumb>
      <MetricsPage
        currentTeam={currentTeam}
        teams={teams}
        changeCurrentTeam={changeCurrentTeam}
      />
    </Panel>
  );
};

export default Page;
