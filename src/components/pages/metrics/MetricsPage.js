import React, { useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import queryString from 'query-string';
import { useLocation, useNavigate } from 'react-router-dom';
import { MetricRequests } from 'angles-javascript-client';
// import { DateRangePicker } from 'rsuite';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import { DateRangePicker } from 'rsuite';
import MetricsResultChart from '../../charts/MetricsResultChart';
import TestPhasesChart from '../../charts/TestPhasesChart';
import PlatformDistributionChart from '../../charts/PlatformDistributionChart';
import ExecutionMetricsSummary from '../../tables/ExecutionMetricsSummary';
import PlatformDistributionPieChart from '../../charts/PlatformDistributionPieChart';
// import './Default.css';
import PlatformMetricsSummary from '../../tables/PlatformMetricsSummary';
import { getRandomColor } from '../../../utility/ChartUtilities';

const MetricsPage = function (props) {
  const location = useLocation();
  const query = queryString.parse(location.search);
  const { teams, currentTeam } = props;
  const {
    component,
    grouping,
    startDate: queryStartDate,
    endDate: queryEndDate,
  } = query;
  const [startDate, setStartDate] = useState(queryStartDate ? moment(queryStartDate) : moment().subtract(30, 'days'));
  const [endDate, setEndDate] = useState(queryEndDate ? moment(queryEndDate) : moment());
  const [groupingPeriod, setGroupingPeriod] = useState(grouping || 'week');
  const [selectedTeam, setSelectedTeam] = useState(currentTeam._id);
  const [selectedComponent, setSelectedComponent] = useState(component || 'any');
  const [key, setKey] = useState('execution');
  const [metrics, setMetrics] = useState({});
  const [platformColors, setPlatformColors] = useState({});
  const metricRequests = new MetricRequests(axios);
  const { afterToday } = DateRangePicker;

  const getPlatformArrayColors = (metricsToUse) => {
    const result = { colors: [] };
    metricsToUse.periods.forEach((period) => {
      period.phases.forEach((phase) => {
        phase.executions.forEach((execution) => {
          if (execution.platforms && execution.platforms.length > 0) {
            execution.platforms.forEach((platform) => {
              if (!result[platform.platformName]) {
                const color = getRandomColor(1)[0];
                result[platform.platformName] = { color };
                result.colors.push(color);
              }
            });
          }
        });
      });
    });
    return result;
  };

  const getMetrics = (teamId, componentId, fromDate, toDate, groupingId) => {
    if (metrics && metrics !== {}) {
      setMetrics(undefined);
    }
    metricRequests.getPhaseMetrics(teamId, componentId, fromDate, toDate, groupingId)
      .then((returnedMetrics) => {
        setMetrics(returnedMetrics);
        setPlatformColors(getPlatformArrayColors(returnedMetrics));
      })
      .catch(() => {
        setMetrics({});
        setPlatformColors({});
      });
  };

  const retrieveMetrics = () => {
    if (endDate && startDate) {
      if (selectedComponent === 'any') {
        getMetrics(selectedTeam, undefined, startDate, endDate, groupingPeriod);
      } else {
        getMetrics(selectedTeam, selectedComponent, startDate, endDate, groupingPeriod);
      }
    }
  };

  useEffect(() => {
    retrieveMetrics();
  }, []);

  // const handleDatesChange = ({ startDate, endDate }) => {
  //   setStartDate(startDate);
  //   setEndDate(endDate);
  // };

  const handleGroupingChange = (event) => {
    setGroupingPeriod(event.target.value);
  };

  const handleTeamChange = (event) => {
    const { changeCurrentTeam } = props;
    changeCurrentTeam(event.target.value);
    setSelectedTeam(event.target.value);
    setSelectedComponent('any');
  };

  const handleComponentChange = (event) => {
    setSelectedComponent(event.target.value);
  };

  const handleSelect = (value) => {
    if (['execution', 'platform'].includes(value)) {
      setKey(value);
    }
  };

  const setTab = (keyToSelect) => {
    handleSelect(keyToSelect);
  };

  const onSubmit = () => {
    const params = {
      teamId: selectedTeam,
      component: selectedComponent,
      grouping: groupingPeriod,
      startDate: startDate.format('YYYY-MM-DD'),
      endDate: endDate.format('YYYY-MM-DD'),
    };
    const navigate = useNavigate();
    // setting the url so people can copy it.
    navigate({
      pathname: '/metrics',
      search: `?${new URLSearchParams(params).toString()}`,
    });
    retrieveMetrics();
  };

  const getComponents = (teamId) => {
    const teamFound = teams.find((team) => team._id === teamId);
    return teamFound.components;
  };

  return (
    <div>
      <h1>Metrics</h1>
      <div className="metrics-form-container">
        <Form>
          <Row>
            <Form.Group as={Col} className="metrics-form-group">
              <Form.Label htmlFor="teamId"><b>Team</b></Form.Label>
              <Form.Control id="teamId" as="select" value={selectedTeam} onChange={handleTeamChange} className="metrics-grouping-period-select">
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
              <Form.Control id="component" as="select" value={selectedComponent} onChange={handleComponentChange} className="metrics-grouping-period-select">
                <option value="any">Any</option>
                {
                  getComponents(selectedTeam).map((componentToDisplay) => (
                    <option key={componentToDisplay._id} value={componentToDisplay._id}>
                      {componentToDisplay.name}
                    </option>
                  ))
                }
              </Form.Control>
            </Form.Group>
            <Form.Group as={Col} className="metrics-form-group-period">
              <Form.Label htmlFor="periodSelect"><b>Period</b></Form.Label>
              <Form.Group>
                <DateRangePicker
                  value={[startDate.toDate(), endDate.toDate()]}
                  onChange={(value) => {
                    setStartDate(moment(value[0]));
                    setEndDate(moment(value[1]));
                  }}
                  disabledDate={afterToday()}
                />
              </Form.Group>
            </Form.Group>
            <Form.Group as={Col} className="metrics-form-group">
              <Form.Label htmlFor="grouping"><b>Grouping</b></Form.Label>
              <Form.Control id="grouping" as="select" value={groupingPeriod} onChange={handleGroupingChange} className="metrics-grouping-period-select">
                <option value="day">Day</option>
                <option value="week">Week</option>
                <option value="fortnight">Fortnight</option>
                <option value="month">Month</option>
                <option value="year">Year</option>
              </Form.Control>
            </Form.Group>
            <Form.Group as={Col} className="metrics-form-group">
              <Button variant="primary" type="button" className="metrics-button" onClick={() => { onSubmit(); }}>Retrieve Metrics</Button>
            </Form.Group>
          </Row>
        </Form>
      </div>
      <div className="metrics-data-container">
        <Tabs id="execution-metrics-tabs" activeKey={key} defaultActiveKey="execution" onSelect={(tabKey, evt) => setTab(tabKey, evt)}>
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
                      <PlatformMetricsSummary metrics={metrics} platformColors={platformColors} />
                    </div>
                    <div className="graphContainerParent">
                      <PlatformDistributionPieChart
                        metrics={metrics}
                        platformColors={platformColors}
                      />
                      <PlatformDistributionChart
                        metrics={metrics}
                        platformColors={platformColors}
                      />
                    </div>
                  </div>
                ) : null
              }
            </div>
          </Tab>
        </Tabs>
      </div>
    </div>
  );
};

export default MetricsPage;
