import React, { Component } from 'react'
import Moment from 'react-moment';
import timeUtility from '../../utility/TimeUtilities'
import { withRouter} from 'react-router-dom';

class BuildsTable extends Component {

constructor(props) {
  super(props);
  this.state = {
    teams: [],
  };
    //this.calculateMetricsForBuilds(props.builds);
}

  getComponentName(build) {
      return build.team.components.find(component => component._id === build.component);
  }

  render() {
    return (
      <table className="table table-hover">
      <thead className="thead-dark">
        <tr>
          <th scope="col">#</th>
          <th scope="col">Name</th>
          <th scope="col">Component</th>
          <th scope="col">Environment</th>
          <th scope="col">Started</th>
          <th scope="col">Finished</th>
          <th scope="col">Execution Time</th>
          <th scope="col">Pass</th>
          <th scope="col">Fail</th>
          <th scope="col">Error</th>
          <th scope="col">Skipped</th>
        </tr>
      </thead>
      <tbody>
        { this.props.builds.map((build, index) => {
          return <tr key={build._id} onDoubleClick={() => this.props.history.push(`/build/?buildId=${build._id}`)}>
            <th scope="row">{ index+1 }</th>
            <td>{build.name}</td>
            <td>{this.getComponentName(build).name}</td>
            <td>{ build.environment.name }</td>
            <td>
              { build.start ? (
                <Moment format="DD-MM-YYYY HH:mm:ss">
                  {build.start}
                </Moment>
              ) : "N/A" }
            </td>
            <td>
            { build.end ? (
              <Moment format="DD-MM-YYYY HH:mm:ss">
                {build.end}
              </Moment>
            ) : "N/A" }
            </td>
            <td>{timeUtility.getDuration(build)}</td>
            <td>{build.result.PASS}</td>
            <td>{build.result.FAIL}</td>
            <td>{build.result.ERROR}</td>
            <td>{build.result.SKIPPED}</td>
          </tr>
        })
      }
      </tbody>
    </table>
    )
  }

};

export default withRouter(BuildsTable);
