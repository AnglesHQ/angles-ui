import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import queryString from 'query-string';
import axios from 'axios';
import { BuildRequests } from 'angles-javascript-client';
import TestRunCompareTable from './TestRunCompareTable';

const TestRunsComparePage = function (props) {
  const location = useLocation();
  const [query] = useState(queryString.parse(location.search));
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
    getTestRunCompareBuilds(currentTeam._id, query.buildIds.split(','));
  }, []);

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

export default TestRunsComparePage;
