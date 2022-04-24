import React, { Component } from 'react';
import Moment from 'react-moment';
import OverlayTrigger from 'react-bootstrap//OverlayTrigger';
import Tooltip from 'react-bootstrap//Tooltip';
import { withRouter } from 'react-router-dom';
import MultiSelect from 'react-multi-select-component';
import Popover from 'react-bootstrap/Popover';
import { getDuration } from '../../utility/TimeUtilities';
import ArtifactsDetailsTable from './ArtifactsDetailsTable';

class BuildsTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      environments: [],
      components: [],
    };
  }

  componentDidMount = () => {
    const { team, availableEnvironments } = this.props;
    this.resetEnvironmentsForTableFilter(availableEnvironments);
    this.resetComponentsForTableFilter(team);
  }

  componentDidUpdate = (prevProps) => {
    // update environments
    const { team, availableEnvironments } = this.props;
    if (prevProps.availableEnvironments !== availableEnvironments) {
      this.resetEnvironmentsForTableFilter(availableEnvironments);
      this.resetSelectedEnvironments();
    }
    // update components when a new team is selected.
    if (prevProps.team !== team) {
      this.resetComponentsForTableFilter(team);
      this.resetSelectedComponents();
    }
  }

  resetSelectedEnvironments = () => {
    const { setFilteredEnvironments } = this.props;
    setFilteredEnvironments([]);
  }

  resetEnvironmentsForTableFilter = (availableEnvironments) => {
    const uniqueEnvironments = {};
    availableEnvironments.forEach((environment) => {
      uniqueEnvironments[environment._id] = environment.name;
    });
    const environments = [];
    Object.keys(uniqueEnvironments).forEach((key) => {
      environments.push({ label: uniqueEnvironments[key], value: key });
    });
    environments.sort((a, b) => ((a.label > b.label) ? 1 : -1));
    this.setState({ environments });
  }

  resetSelectedComponents = () => {
    const { setFilteredComponents } = this.props;
    setFilteredComponents([]);
  }

  resetComponentsForTableFilter = (team) => {
    const uniqueComponents = {};
    team.components.forEach((component) => {
      uniqueComponents[component._id] = component.name;
    });
    const components = [];
    Object.keys(uniqueComponents).forEach((key) => {
      components.push({ label: uniqueComponents[key], value: key });
    });
    components.sort((a, b) => ((a.label > b.label) ? 1 : -1));
    this.setState({ components });
  }

  isRowSelected = (build) => {
    const { selectedBuilds } = this.props;
    return selectedBuilds[build._id];
  }

  anyRowsSelected = () => {
    const { retrieveSelectedBuilds } = this.props;
    const selectedRowsArray = retrieveSelectedBuilds();
    return (Object.keys(selectedRowsArray).length > 0);
  }

  getComponentName = (build) => build.team.components
    .find((component) => component._id === build.component);

  setSelectedEnvironments = (selectedEnvironments) => {
    const { setFilteredEnvironments } = this.props;
    setFilteredEnvironments(selectedEnvironments);
  }

  setSelectedComponents = (selectedComponents) => {
    const { setFilteredComponents } = this.props;
    setFilteredComponents(selectedComponents);
  }

  render() {
    const componentOverrideStrings = {
      selectSomeItems: 'Components...',
      allItemsAreSelected: 'All components',
    };

    const environmentOverrideStrings = {
      selectSomeItems: 'Environments...',
      allItemsAreSelected: 'All environments',
    };

    const {
      components,
      environments,
    } = this.state;

    const {
      builds,
      toggleSelectedBuild,
      currentSkip,
      selectedEnvironments,
      selectedComponents,
    } = this.props;

    const buildRows = [];
    let count = 0;
    builds.forEach((build) => {
      count += 1;
      const popover = (
        <Popover id="popover-basic">
          <Popover.Title as="h3">
            <b>Artifacts</b>
          </Popover.Title>
          <Popover.Content>
            <ArtifactsDetailsTable artifacts={build.artifacts} />
          </Popover.Content>
        </Popover>
      );
      buildRows.push(
        <tr key={build._id}>
          <th scope="row">{currentSkip + count}</th>
          <td onClick={() => toggleSelectedBuild(build)}>
            <div key={this.isRowSelected(build)}>
              <i className={this.isRowSelected(build) ? ('far fa-check-square') : 'far fa-square'} />
            </div>
          </td>
          <td>
            {
              build.keep ? (
                <div><i className="fas fa-lock" /></div>
              ) : null
            }
          </td>
          <td>
            <div className="report-link">
              <a href={`/build/?buildId=${build._id}`} target="_self">
                <i className="fas fa-external-link-alt" />
              </a>
            </div>
          </td>
          <td>
            <div>
              <OverlayTrigger trigger="click" rootClose placement="right" overlay={popover}>
                <span className="matrix-info-icon fa-stack fa-5x has-badge" data-count={build.artifacts.length}>
                  <i className="fa fa-circle fa-stack-2x" />
                  <i className="fas fa-clipboard-list fa-stack-1x fa-inverse" />
                </span>
              </OverlayTrigger>
            </div>
          </td>
          <td>
            <a href={`/build/?buildId=${build._id}`} target="_self">
              {build.name}
            </a>
          </td>
          <td>
            {
              build.phase ? (
                build.phase.name
              ) : 'none'
            }
          </td>
          <td>{this.getComponentName(build).name}</td>
          <td>{build.environment.name}</td>
          <td>
            {build.start ? (
              <Moment format="DD-MM-YYYY HH:mm:ss">
                {build.start}
              </Moment>
            ) : 'N/A'}
          </td>
          <td>
            {build.end ? (
              <Moment format="DD-MM-YYYY HH:mm:ss">
                {build.end}
              </Moment>
            ) : 'N/A'}
          </td>
          <td>{getDuration(build)}</td>
          <td>{build.result.PASS}</td>
          <td>{build.result.FAIL}</td>
          <td>{build.result.ERROR}</td>
          <td>{build.result.SKIPPED}</td>
        </tr>,
      );
    });

    return (
      <div>
        <table className="table table-hover summary-table">
          <thead className="thead-dark">
            <tr>
              <th scope="col">#</th>
              <th scope="col">
                <div key={this.anyRowsSelected()}>
                  <i className={this.anyRowsSelected() ? ('fas fa-check-square') : 'fas fa-square'} />
                </div>
              </th>
              <th scope="col">
                <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">By setting the &quot;keep&quot; flag the build will not be removed by the nightly clean-up.</Tooltip>}>
                  <div><i className="fas fa-lock" /></div>
                </OverlayTrigger>
              </th>
              <th scope="col">
                <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">Click on the links below to go to the individual build reports.</Tooltip>}>
                  <div><i className="fas fa-external-link-alt" /></div>
                </OverlayTrigger>
              </th>
              <th scope="col" style={{ minWidth: '115px' }}>
                <span>Artifacts </span>
                <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">Click on the icons below to see the build artifacts versions that were tested as part of the run (you have to enter these using the Angles client).</Tooltip>}>
                  <span>
                    <i className="fas fa-info-circle" />
                  </span>
                </OverlayTrigger>
              </th>
              <th scope="col">Name</th>
              <th scope="col">Phase</th>
              <th scope="col">
                <MultiSelect
                  className="build-table-filter"
                  options={components}
                  value={selectedComponents}
                  onChange={this.setSelectedComponents}
                  overrideStrings={componentOverrideStrings}
                  hasSelectAll={false}
                />
              </th>
              <th scope="col">
                <MultiSelect
                  className="build-table-filter"
                  options={environments}
                  value={selectedEnvironments}
                  onChange={this.setSelectedEnvironments}
                  labelledBy="Environment"
                  overrideStrings={environmentOverrideStrings}
                  hasSelectAll={false}
                />
              </th>
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
            {buildRows}
          </tbody>
        </table>
      </div>
    );
  }
}

export default withRouter(BuildsTable);
