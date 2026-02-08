import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import { connect } from 'react-redux';
import { BuildRequests } from 'angles-javascript-client';
import TestRunCompareTable from './TestRunCompareTable';

const TestRunsComparePage = function (props) {
  const searchParams = useSearchParams();
  const buildIds = searchParams.get('buildIds');
  const [testRunCompareBuilds, setTestRunCompareBuilds] = useState([]);
  const buildRequests = new BuildRequests(axios);

  const getTestRunCompareBuilds = (teamId, buildIds) => {
    if (!teamId) return [];
    return buildRequests.getBuilds(teamId, buildIds, true)
      .then((response) => {
        setTestRunCompareBuilds(response.builds);
      });
  };

  useEffect(() => {
    const { currentTeam } = props;
    if (currentTeam && buildIds) {
      getTestRunCompareBuilds(currentTeam._id, buildIds.split(','));
    }
  }, [props.currentTeam, buildIds]);

  return (
    (testRunCompareBuilds.length === 0) ? (
      <div className="alert alert-primary" role="alert">
        <span>
          <i className="fas fa-spinner fa-pulse fa-2x" />
          <span> Retrieving build details to generate the matrix view.</span>
        </span>
      </div>
    ) : (
      <TestRunCompareTable testRunCompareBuilds={testRunCompareBuilds} />
    )
  );
};

const mapStateToProps = (state) => ({
  currentTeam: state.teamsReducer.currentTeam,
});

export default connect(mapStateToProps, null)(TestRunsComparePage);
