import React, { Component } from 'react'
import MatrixTable from '../tables/MatrixTable';
import axios from 'axios';
import '../charts/Charts.css'
import queryString from 'query-string';

class MatrixPage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      matrixBuilds: [],
      query: queryString.parse(this.props.location.search),
    };
  }

  componentDidMount() {
    this.getBuildsForMatrix(this.props.currentTeam._id, this.state.query.buildIds);
  }


  getBuildsForMatrix = (teamId, buildIds) => {
    if (!teamId) return []
    return axios.get('/build?teamId=' + teamId + '&buildIds=' + buildIds + '&returnExecutionDetails=true')
    .then((res) =>
      this.setState({ matrixBuilds: res.data.builds})
    )
  }

  render() {
    if (this.state.matrixBuilds.length === 0) {
      return <div className="alert alert-primary" role="alert">
        <span><i className="fas fa-spinner fa-pulse fa-2x"></i> Retrieving build details to generate the matrix view.</span>
      </div>;
    }
    return (
      <div>
        <h1>Matrix</h1>
          <MatrixTable matrixBuilds={this.state.matrixBuilds.reverse()} />
      </div>
    );
  }
}

export default MatrixPage;
