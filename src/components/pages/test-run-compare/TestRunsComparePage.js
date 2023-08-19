import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import queryString from 'query-string';
import axios from 'axios';
import { BuildRequests } from 'angles-javascript-client';
import MatrixTable from './MatrixTable';

const TestRunsComparePage = function (props) {
  const location = useLocation();
  const [query] = useState(queryString.parse(location.search));
  const [matrixBuilds, setMatrixBuilds] = useState([]);
  const buildRequests = new BuildRequests(axios);

  const getBuildsForMatrix = (teamId, buildIds) => {
    if (!teamId) return [];
    return buildRequests.getBuilds(teamId, buildIds, true)
      .then((response) => {
        setMatrixBuilds(response.builds);
      });
  };

  useEffect(() => {
    const { currentTeam } = props;
    getBuildsForMatrix(currentTeam._id, query.buildIds.split(','));
  }, []);

  return (
    (matrixBuilds.length === 0) ? (
      <div className="alert alert-primary" role="alert">
        <span>
          <i className="fas fa-spinner fa-pulse fa-2x" />
          <span> Retrieving build details to generate the matrix view.</span>
        </span>
      </div>
    ) : (
      <MatrixTable matrixBuilds={matrixBuilds.reverse()} />
    )
  );
};

export default TestRunsComparePage;
