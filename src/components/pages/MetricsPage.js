import React, { Component } from 'react';
import axios from 'axios';
import moment from 'moment';
import queryString from 'query-string';
import { withRouter } from 'react-router-dom';
import { MetricRequests } from 'angles-javascript-client';
import MetricsResultChart from '../charts/MetricsResultChart';
import TestPhasesChart from '../charts/TestPhasesChart';
import DatePicker from '../elements/DatePicker';

class SummaryPage extends Component {
  constructor(props) {
    super(props);
    const { location } = this.props;
    this.state = {
      startDate: moment().subtract(30, 'days'),
      endDate: moment(),
      groupingPeriod: 'week',
      selectedTeam: props.currentTeam._id,
      selectedComponent: 'any',
      // eslint-disable-next-line react/no-unused-state
      query: queryString.parse(location.search),
    };
    this.metricRequests = new MetricRequests(axios);
    const {
      startDate,
      endDate,
      groupingPeriod,
    } = this.state;
    this.getMetrics(props.currentTeam._id, undefined, startDate, endDate, groupingPeriod);
  }

  componentDidMount() {
    /**
     * 1. We need per period, pass/fail rate ( + number of builds)
     * 2. Per phase in a period.
     *  - number of executions and builds (per day)?
     *  - pass/failure rate (per day)?
     *  - length of time
     *  - compare against other periods?
     */
  }

  componentDidUpdate(prevProps, prevState) {
    const {
      endDate,
      startDate,
      groupingPeriod,
      selectedComponent,
    } = this.state;
    const { currentTeam } = this.props;
    if (endDate && startDate && (endDate !== prevState.endDate
        || startDate !== prevState.startDate
        || groupingPeriod !== prevState.groupingPeriod
        || currentTeam !== prevProps.currentTeam
        || selectedComponent !== prevState.selectedComponent)) {
      if (selectedComponent === 'any') {
        this.getMetrics(currentTeam._id, undefined, startDate, endDate, groupingPeriod);
      } else {
        this.getMetrics(currentTeam._id, selectedComponent, startDate, endDate, groupingPeriod);
      }
    }
  }

  getMetrics = (teamId, componentId, fromDate, toDate, groupingId) => {
    this.metricRequests.getPhaseMetrics(teamId, componentId, fromDate, toDate, groupingId)
      .then((metrics) => {
        this.setState({ metrics });
      });
  }

  handleDatesChange = ({ startDate, endDate }) => {
    this.setState({ startDate, endDate });
  };

  handleGroupingChange = (event) => {
    this.setState({ groupingPeriod: event.target.value });
  }

  handleTeamChange = (event) => {
    const { changeCurrentTeam } = this.props;
    changeCurrentTeam(event.target.value);
    this.setState({ selectedTeam: event.target.value, selectedComponent: 'any' });
  }

  handleComponentChange = (event) => {
    this.setState({ selectedComponent: event.target.value });
  }

  render() {
    const {
      metrics,
      endDate,
      startDate,
      groupingPeriod,
      selectedTeam,
      selectedComponent,
    } = this.state;
    const { currentTeam, teams } = this.props;
    return (
      <div>
        <h1>{`Metrics for team ${currentTeam.name}`}</h1>
        <div className="date-picker-surround">
          <span className="team-span">Team</span>
          <select value={selectedTeam} onChange={this.handleTeamChange} className="metrics-grouping-period-select">
            {
              teams.map((team) => <option value={team._id}>{team.name}</option>)
            }
          </select>
          <span className="metrics-span">Component</span>
          <select value={selectedComponent} onChange={this.handleComponentChange} className="metrics-grouping-period-select">
            <option value="any">Any</option>
            {
              currentTeam.components.map((component) => (
                <option value={component._id}>
                  {component.name}
                </option>
              ))
            }
          </select>
          <span className="metrics-span">Period</span>
          <DatePicker
            className="metrics-date-picker"
            startDate={startDate}
            endDate={endDate}
            handleDatesChange={this.handleDatesChange}
          />
          <span className="metrics-span">Grouping: </span>
          <select value={groupingPeriod} onChange={this.handleGroupingChange} className="metrics-grouping-period-select">
            <option value="day">Day</option>
            <option value="week">Week</option>
            <option value="fortnight">Fortnight</option>
            <option value="month">Month</option>
            <option value="year">Year</option>
          </select>
        </div>
        {
          metrics ? (
            <div className="graphContainerParent">
              <MetricsResultChart metrics={metrics} />
              <TestPhasesChart metrics={metrics} />
            </div>
          ) : null
        }
      </div>
    );
  }
}

export default withRouter(SummaryPage);
