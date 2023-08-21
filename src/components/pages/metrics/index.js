import React from 'react';
import { Breadcrumb, Panel } from 'rsuite';
import MetricsPage from './MetricsPage';

const Page = function (props) {
  const { teams, currentTeam, changeCurrentTeam } = props;
  return (
    <Panel>
      <Breadcrumb>
        <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
        <Breadcrumb.Item>Metrics</Breadcrumb.Item>
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
