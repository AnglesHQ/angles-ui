import React, { Component } from 'react';
import axios from 'axios';
import moment from 'moment';
import queryString from 'query-string';
import { withRouter } from 'react-router-dom';
import { MetricRequests } from 'angles-javascript-client';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import MetricsResultChart from '../charts/MetricsResultChart';
import TestPhasesChart from '../charts/TestPhasesChart';
import DatePicker from '../elements/DatePicker';
import ExecutionMetricsSummary from '../tables/ExecutionMetricsSummary';
import './Default.css';

class MetricsPage extends Component {
  constructor(props) {
    super(props);
    const { location } = this.props;
    const query = queryString.parse(location.search);
    const {
      component,
      grouping,
      startDate,
      endDate,
    } = query;
    this.state = {
      startDate: startDate ? moment(startDate) : moment().subtract(30, 'days'),
      endDate: endDate ? moment(endDate) : moment(),
      groupingPeriod: grouping || 'week',
      selectedTeam: props.currentTeam._id,
      selectedComponent: component || 'any',
    };
    this.metricRequests = new MetricRequests(axios);
  }

  componentDidMount() {
    this.retrieveMetrics();
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

  handleSelect(value) {
    if (['execution', 'platform'].includes(value)) this.setState({ key: value });
  }

  setTab = (key) => {
    this.handleSelect(key);
  }

  onSubmit = () => {
    const { history } = this.props;
    const {
      endDate,
      startDate,
      groupingPeriod,
      selectedComponent,
      selectedTeam,
    } = this.state;
    const params = {
      teamId: selectedTeam,
      component: selectedComponent,
      grouping: groupingPeriod,
      startDate: startDate.format('YYYY-MM-DD'),
      endDate: endDate.format('YYYY-MM-DD'),
    };
    // setting the url so people can copy it.
    history.push({
      pathname: '/metrics',
      search: `?${new URLSearchParams(params).toString()}`,
    });
    this.retrieveMetrics();
  }

  getComponents = (teamId) => {
    const { teams } = this.props;
    const selectedTeam = teams.find((team) => team._id === teamId);
    return selectedTeam.components;
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

  retrieveMetrics = () => {
    const {
      endDate,
      startDate,
      groupingPeriod,
      selectedComponent,
      selectedTeam,
    } = this.state;
    if (endDate && startDate) {
      if (selectedComponent === 'any') {
        this.getMetrics(selectedTeam, undefined, startDate, endDate, groupingPeriod);
      } else {
        this.getMetrics(selectedTeam, selectedComponent, startDate, endDate, groupingPeriod);
      }
    }
  }

  render() {
    const {
      metrics,
      endDate,
      startDate,
      groupingPeriod,
      selectedTeam,
      selectedComponent,
      key,
    } = this.state;
    const { teams } = this.props;

    return (
      <div>
        <h1>Metrics</h1>
        <div className="metrics-form-container">
          <Form>
            <Form.Row>
              <Form.Group as={Col} className="metrics-form-group">
                <Form.Label htmlFor="teamId"><b>Team</b></Form.Label>
                <Form.Control id="teamId" as="select" value={selectedTeam} onChange={this.handleTeamChange} className="metrics-grouping-period-select">
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
                <Form.Label htmlFor="component"><b>Component</b></Form.Label>
                <Form.Control id="component" as="select" value={selectedComponent} onChange={this.handleComponentChange} className="metrics-grouping-period-select">
                  <option value="any">Any</option>
                  {
                    this.getComponents(selectedTeam).map((component) => (
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
                <Form.Label htmlFor="grouping"><b>Grouping</b></Form.Label>
                <Form.Control id="grouping" as="select" value={groupingPeriod} onChange={this.handleGroupingChange} className="metrics-grouping-period-select">
                  <option value="day">Day</option>
                  <option value="week">Week</option>
                  <option value="fortnight">Fortnight</option>
                  <option value="month">Month</option>
                  <option value="year">Year</option>
                </Form.Control>
              </Form.Group>
              <Form.Group as={Col} className="metrics-form-group">
                <Button variant="primary" type="button" className="metrics-button" onClick={() => { this.onSubmit(); }}>Retrieve Metrics</Button>
              </Form.Group>
            </Form.Row>
          </Form>
        </div>
        <div className="metrics-data-container">
          <Tabs id="execution-metrics-tabs" activeKey={key} defaultActiveKey="execution" onSelect={(tabKey, evt) => this.setTab(tabKey, evt)}>
            <Tab eventKey="execution" title="Execution Metrics">
              <div className="metrics-surround">
                <div style={{ display: !metrics ? 'block' : 'none' }} className="alert alert-primary" role="alert">
                  <span>
                    <i className="fas fa-spinner fa-pulse fa-2x" />
                    <span> Retrieving metrics.</span>
                  </span>
                </div>
                <div style={{ display: (metrics && Object.keys(metrics).length === 0) ? 'block' : 'none' }} className="alert alert-danger" role="alert">
                  <span>Unable to retrieve metrics. Please refresh the page and try again.</span>
                </div>
                {
                  metrics && Object.keys(metrics).length > 0 ? (
                    <div style={{ display: (metrics && Object.keys(metrics).length > 0) ? 'block' : 'none' }}>
                      <div className="metrics-table-div">
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
            </Tab>
            <Tab eventKey="platform" title="Platform Metrics">
              <div className="metrics-surround">
                <span>More to come soon (watch this space).</span>
              </div>
            </Tab>
          </Tabs>
        </div>
      </div>
    );
  }
}

export default withRouter(MetricsPage);
