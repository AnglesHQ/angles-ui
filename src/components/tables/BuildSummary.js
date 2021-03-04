import React, { Component } from 'react';
import Moment from 'react-moment';
import { getDuration } from '../../utility/TimeUtilities';

class BuildSummary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      //
    };
  }

  render() {
    const { build } = this.props;
    return (
      <table className="table">
        <thead className="thead-dark">
          <tr>
            <th scope="col" colSpan="100%">Build Summary</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">Name</th>
            <td>{build.name}</td>
            <th scope="row">PASS</th>
            <td>{build.result.PASS}</td>
          </tr>
          <tr>
            <th scope="row">Start</th>
            <td>
              <Moment format="DD-MM-YYYY HH:mm:ss">
                {build.start}
              </Moment>
            </td>
            <th scope="row">FAIL</th>
            <td>{build.result.FAIL}</td>
          </tr>
          <tr>
            <th scope="row">Finish</th>
            <td>
              <Moment format="DD-MM-YYYY HH:mm:ss">
                {build.end}
              </Moment>
            </td>
            <th scope="row">ERROR</th>
            <td>{build.result.ERROR}</td>
          </tr>
          <tr>
            <th scope="row">Duration</th>
            <td>{getDuration(build)}</td>
            <th scope="row">SKIPPED</th>
            <td>{build.result.SKIPPED}</td>
          </tr>
        </tbody>
      </table>
    );
  }
}

export default BuildSummary;
