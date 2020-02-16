import React, { Component } from 'react'
import Moment from 'react-moment';
import timeUtility from '../../utility/TimeUtilities'

class BuildSummary extends Component {

  constructor(props) {
    super(props);
    console.log(props);
    this.state = {
      //
    };
      //this.calculateMetricsForBuilds(props.builds);
  }

  render() {
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
              <td>{this.props.build.name}</td>
              <th scope="row">PASS</th>
              <td>{this.props.build.result.PASS}</td>
            </tr>
            <tr>
              <th scope="row">Start</th>
              <td>
              <Moment format="DD-MM-YYYY HH:mm:ss">
                {this.props.build.start}
              </Moment>
              </td>
              <th scope="row">FAIL</th>
              <td>{this.props.build.result.FAIL}</td>
            </tr>
            <tr>
              <th scope="row">Finish</th>
              <td>
                <Moment format="DD-MM-YYYY HH:mm:ss">
                  {this.props.build.end}
                </Moment>
              </td>
              <th scope="row">ERROR</th>
              <td>{this.props.build.result.ERROR}</td>
            </tr>
            <tr>
              <th scope="row">Duration</th>
              <td>{timeUtility.getDuration(this.props.build)}</td>
              <th scope="row">SKIPPED</th>
              <td>{this.props.build.result.SKIPPED}</td>
            </tr>
        </tbody>
      </table>
    )
  };

};

export default BuildSummary
