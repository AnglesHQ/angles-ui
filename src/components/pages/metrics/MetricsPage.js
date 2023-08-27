import React, { useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import queryString from 'query-string';
import { useLocation, useNavigate } from 'react-router-dom';
import { MetricRequests } from 'angles-javascript-client';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import {
  Affix,
  DateRangePicker,
  SelectPicker,
  Stack,
  Form,
  Button,
  Panel,
  Col,
  Row,
  Grid,
} from 'rsuite';
import TestPhasesChart from '../../charts/TestPhasesChart';
import PlatformDistributionChart from '../../charts/PlatformDistributionChart';
import ExecutionMetricsSummary from './ExecutionMetricsSummary';
import PlatformDistributionPieChart from '../../charts/PlatformDistributionPieChart';
import PlatformMetricsSummary from './PlatformMetricsSummary';
import { getRandomColor } from '../../../utility/ChartUtilities';
import MetricsResultChart from '../../charts/MetricsResultChart';
import { getDateRangesPicker } from '../../../utility/TimeUtilities';

const MetricsPage = function (props) {
  const navigate = useNavigate();
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

  const handleGroupingChange = (groupingValue) => {
    setGroupingPeriod(groupingValue);
  };

  const handleTeamChange = (teamId) => {
    const { changeCurrentTeam } = props;
    changeCurrentTeam(teamId);
    setSelectedTeam(teamId);
    setSelectedComponent('any');
  };

  const handleComponentChange = (componentId) => {
    setSelectedComponent(componentId);
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
      <Affix>
        <Stack className="rg-stack" spacing={10}>
          <Form>
            <SelectPicker
              cleanable={false}
              // searchable={false}
              label="Team"
              appearance="subtle"
              data={teams.map((team) => ({ label: team.name, value: team._id }))}
              value={selectedTeam}
              onChange={(value) => {
                if (value) {
                  handleTeamChange(value);
                }
              }}
            />
            <SelectPicker
              cleanable
              // searchable={false}
              appearance="subtle"
              label="Component"
              data={getComponents(selectedTeam)
                .map((teamComponent) => ({ label: teamComponent.name, value: teamComponent._id }))}
              value={selectedComponent}
              onChange={(value) => {
                if (value) {
                  handleComponentChange(value);
                }
              }}
              onClean={() => {
                setSelectedComponent(undefined);
              }}
            />
            <DateRangePicker
              label="Date Range"
              value={[startDate.toDate(), endDate.toDate()]}
              format="dd-MMM-yyyy"
              character=" - "
              onChange={(value) => {
                setStartDate(moment(value[0]));
                setEndDate(moment(value[1]));
              }}
              shouldDisableDate={afterToday()}
              cleanable={false}
              ranges={getDateRangesPicker()}
            />
            <SelectPicker
              label="Group By Period"
              cleanable={false}
              // searchable={false}
              appearance="subtle"
              data={[
                { label: 'Day', value: 'day' },
                { label: 'Week', value: 'week' },
                { label: 'Fortnight', value: 'fortnight' },
                { label: 'Month', value: 'month' },
                { label: 'Year', value: 'year' },
              ]}
              value={groupingPeriod}
              onChange={(value) => {
                if (value) {
                  handleGroupingChange(value);
                }
              }}
            />
            <Button variant="primary" type="button" className="metrics-button" onClick={() => { onSubmit(); }}>Retrieve Metrics</Button>
          </Form>
        </Stack>
      </Affix>
      <div className="metrics-data-container">
        <Tabs className="execution-metrics-tabs" id="execution-metrics-tabs" activeKey={key} defaultActiveKey="execution" onSelect={(tabKey, evt) => setTab(tabKey, evt)}>
          <Tab eventKey="execution" title="Execution Metrics">
            <Panel
              bordered
              className="execution-metrics-panel"
            >
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
                    <Grid fluid>
                      <Row gutter={30} className="dash-row">
                        <Col xs={24}>
                          <ExecutionMetricsSummary metrics={metrics} />
                        </Col>
                      </Row>
                      <Row gutter={30} className="dash-row">
                        <Col xs={12}>
                          <MetricsResultChart metrics={metrics} />
                        </Col>
                        <Col xs={12}>
                          <TestPhasesChart metrics={metrics} />
                        </Col>
                      </Row>
                    </Grid>
                  </div>
                ) : null
              }
            </Panel>
          </Tab>
          <Tab eventKey="platform" title="Platform Metrics">
            <Panel
              bordered
              className="execution-metrics-panel"
            >
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
                    <Grid fluid>
                      <Row gutter={30} className="dash-row">
                        <Col xs={24}>
                          <PlatformMetricsSummary
                            metrics={metrics}
                            platformColors={platformColors}
                          />
                        </Col>
                      </Row>
                      <Row gutter={30} className="dash-row">
                        <Col xs={12}>
                          <PlatformDistributionPieChart
                            metrics={metrics}
                            platformColors={platformColors}
                          />
                        </Col>
                        <Col xs={12}>
                          <PlatformDistributionChart
                            metrics={metrics}
                            platformColors={platformColors}
                          />
                        </Col>
                      </Row>
                    </Grid>
                  </div>
                ) : null
              }
            </Panel>
          </Tab>
        </Tabs>
      </div>
    </div>
  );
};

export default MetricsPage;
