import React, { Component } from 'react'
import Moment from 'react-moment';
import { getDuration} from '../../utility/TimeUtilities'
import { withRouter} from 'react-router-dom';

class BuildsTable extends Component {

constructor(props) {
  super(props);
  this.state = {
    teams: []
  };
}

isRowSelected = (build) => {
  return this.props.selectedBuilds[build._id];
}

anyRowsSelected = () => {
  let selectedRowsArray = this.props.retrievSelectedBuilds();
  return (Object.keys(selectedRowsArray).length > 0);
}

getComponentName = (build) => {
    return build.team.components.find(component => component._id === build.component);
}

render() {
  return (
    <div>
    <table className="table table-hover summary-table">
    <thead className="thead-dark">
      <tr>
        <th scope="col">#</th>
        <th scope="col">{ <div key={this.anyRowsSelected()}><i className={ this.anyRowsSelected() ? ('fas fa-check-square'): 'fas fa-square' }/></div> }</th>
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
        return <tr key={build._id} onClick={() => this.props.toggleSelectedBuild(build)} onDoubleClick={() => this.props.history.push(`/build/?buildId=${build._id}`)}>
          <th scope="row">{ index+this.props.currentSkip+1 }</th>
          <td>
            { <div key={this.isRowSelected(build)}><i className={ this.isRowSelected(build) ? ('far fa-check-square'): 'far fa-square' }/></div> }
          </td>
          <td>{build.name}</td>
          <td>{ this.getComponentName(build).name }</td>
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
          <td>{getDuration(build)}</td>
          <td>{build.result.PASS}</td>
          <td>{build.result.FAIL}</td>
          <td>{build.result.ERROR}</td>
          <td>{build.result.SKIPPED}</td>
        </tr>
      })
    }
    </tbody>
  </table>
  </div>
  )
}

};

export default withRouter(BuildsTable);
