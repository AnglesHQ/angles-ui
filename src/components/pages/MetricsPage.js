import React, { Component } from 'react';
import axios from 'axios';
import moment from 'moment';
import queryString from 'query-string';
import { withRouter } from 'react-router-dom';
import { MetricRequests } from 'angles-javascript-client';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import MetricsResultChart from '../charts/MetricsResultChart';
import TestPhasesChart from '../charts/TestPhasesChart';
import DatePicker from '../elements/DatePicker';
import ExecutionMetricsSummary from '../tables/ExecutionMetricsSummary';
import './Default.css';

class MetricsPage extends Component {
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
    const { metrics } = this.state;
    if (metrics && metrics !== {}) {
      this.setState({ metrics: undefined });
    }
    this.metricRequests.getPhaseMetrics(teamId, componentId, fromDate, toDate, groupingId)
      .then((returnedMetrics) => {
        this.setState({ metrics: returnedMetrics });
      })
      .catch(() => {
        this.setState({ metrics: {} });
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

    if (!metrics) {
      return (
        <div>
          <h1>Metrics</h1>
          <div className="alert alert-primary" role="alert">
            <span>
              <i className="fas fa-spinner fa-pulse fa-2x" />
              <span> Retrieving metrics.</span>
            </span>
          </div>
        </div>
      );
    }
    if (Object.keys(metrics).length === 0) {
      return (
        <div>
          <h1>Metrics</h1>
          <div className="alert alert-danger" role="alert">
            <span> Unable to retrieve metrics. Please refresh the page and try again.</span>
          </div>
        </div>
      );
    }
    return (
      <div>
        <h1>Metrics</h1>
        <div className="metrics-form-container">
          <Form>
            <Form.Row>
              <Form.Group as={Col} className="metrics-form-group">
                <Form.Label htmlFor="teamSelect"><b>Team</b></Form.Label>
                <Form.Control id="teamSelect" as="select" value={selectedTeam} onChange={this.handleTeamChange} className="metrics-grouping-period-select">
                  {
                    teams.map((team) => (
                      <option key={team._id} value={team._id}>
                        {team.name}
                      </option>
                    ))
                  }
                </Form.Control>
              </Form.Group>
              <Form.Group as={Col} className="metrics-form-group">
                <Form.Label htmlFor="componentSelect"><b>Component</b></Form.Label>
                <Form.Control id="componentSelect" as="select" value={selectedComponent} onChange={this.handleComponentChange} className="metrics-grouping-period-select">
                  <option value="any">Any</option>
                  {
                    currentTeam.components.map((component) => (
                      <option key={component._id} value={component._id}>
                        {component.name}
                      </option>
                    ))
                  }
                </Form.Control>
              </Form.Group>
              <Form.Group as={Col} className="metrics-form-group-period">
                <Form.Label htmlFor="periodSelect"><b>Period</b></Form.Label>
                <DatePicker
                  className="metrics-date-picker"
                  startDate={startDate}
                  endDate={endDate}
                  handleDatesChange={this.handleDatesChange}
                />
              </Form.Group>
              <Form.Group as={Col} className="metrics-form-group">
                <Form.Label htmlFor="groupingSelect"><b>Grouping</b></Form.Label>
                <Form.Control id="groupingSelect" as="select" value={groupingPeriod} onChange={this.handleGroupingChange} className="metrics-grouping-period-select">
                  <option value="day">Day</option>
                  <option value="week">Week</option>
                  <option value="fortnight">Fortnight</option>
                  <option value="month">Month</option>
                  <option value="year">Year</option>
                </Form.Control>
              </Form.Group>
            </Form.Row>
          </Form>
        </div>
        {
          metrics && metrics !== {} ? (
            <div>
              <div className="execution-metrics-table-container">
                <ExecutionMetricsSummary metrics={metrics} />
              </div>
              <div className="graphContainerParent">
                <MetricsResultChart metrics={metrics} />
                <TestPhasesChart metrics={metrics} />
              </div>
            </div>
          ) : null
        }
      </div>
    );
  }
}

export default withRouter(MetricsPage);
