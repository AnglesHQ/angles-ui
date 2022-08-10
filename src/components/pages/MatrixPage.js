import React, { Component } from 'react';
import queryString from 'query-string';
import { withRouter } from 'react-router-dom';
import axios from 'axios';
import { BuildRequests } from 'angles-javascript-client';
import MatrixTable from '../tables/MatrixTable';
import '../charts/Charts.css';

class MatrixPage extends Component {
  constructor(props) {
    super(props);
    const { location } = this.props;
    this.state = {
      matrixBuilds: [],
      query: queryString.parse(location.search),
    };
    this.buildRequests = new BuildRequests(axios);
  }

  componentDidMount() {
    const { currentTeam } = this.props;
    const { query } = this.state;
    this.getBuildsForMatrix(currentTeam._id, query.buildIds.split(','));
  }

  getBuildsForMatrix = (teamId, buildIds) => {
    if (!teamId) return [];
    return this.buildRequests.getBuilds(teamId, buildIds, true)
      .then((response) => this.setState({ matrixBuilds: response.builds }));
  };

  render() {
    const { matrixBuilds } = this.state;
    if (matrixBuilds.length === 0) {
      return (
        <div className="alert alert-primary" role="alert">
          <span>
            <i className="fas fa-spinner fa-pulse fa-2x" />
            <span> Retrieving build details to generate the matrix view.</span>
          </span>
        </div>
      );
    }
    return (
      <div>
        <h1>Matrix</h1>
        <MatrixTable matrixBuilds={matrixBuilds.reverse()} />
      </div>
    );
  }
}

export default withRouter(MatrixPage);
