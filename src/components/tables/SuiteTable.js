import React, { Component } from 'react'
import timeUtility from '../../utility/TimeUtilities'
import Moment from 'react-moment';
import moment from 'moment'

class SuiteTable extends Component {

  constructor(props) {
    super(props);
    console.log(props);
    this.state = {
      suite: [],
    };
      //this.calculateMetricsForBuilds(props.builds);
  }

  render() {
    return (
      <table className="table table-hover">
      <thead className="thead-dark">
        <tr>
          <th scope="col" colSpan="100%">{this.props.suite.name}</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th>#</th>
          <th>Title</th>
          <th>Status</th>
          <th>Duraction</th>
        </tr>
        { this.props.suite.executions.map((execution, index) => {
          return <tr key={index}>
            <th scope="row">{ index+1 }</th>
            <td>{execution.title}</td>
            <td>{execution.status}</td>
            <td>
              { timeUtility.getDuration(execution) }
            </td>
          </tr>
        })
      }
      </tbody>
    </table>
    )
  }

};

export default SuiteTable
