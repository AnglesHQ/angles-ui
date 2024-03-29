import React from 'react';
import { Panel } from 'rsuite';
import DashboardPage from './DashboardPage';

const Page = function (props) {
  const { changeCurrentTeam } = props;
  return (
    <Panel>
      <DashboardPage changeCurrentTeam={changeCurrentTeam} />
    </Panel>
  );
};

export default Page;
