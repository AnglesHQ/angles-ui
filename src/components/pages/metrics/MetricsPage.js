'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import { connect } from 'react-redux';
import { FormattedMessage, useIntl } from 'react-intl';
import queryString from 'query-string';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { MetricRequests } from 'angles-javascript-client';
import {
  Affix,
  DateRangePicker,
  Loader,
  SelectPicker,
  Stack,
  Button,
  Col,
  Row,
  Grid,
  Tabs,
} from 'rsuite';
import ExecutionMetricsSummary from './ExecutionMetricsSummary';
import PlatformDistributionPieChart from './charts/PlatformDistributionPieChart';
import PlatformStatusBarChart from '../../features/platform-status-chart';
import PlatformMetricsSummary from './PlatformMetricsSummary';
import { getPaletteColor, getPlatformLabel } from '../../../utility/ChartConfig';
import { getDateRangesPicker } from '../../../utility/TimeUtilities';
import ExecutionMetricsResultsBarChart from './charts/ExecutionMetricsResultsBarChart';
import PhaseMetricsResultsBarChart from './charts/PhaseMetricsResultsBarChart';
import { ALL_EXECUTION_TYPES, getExecutionTypeOptions, toExecutionTypeParam } from '../../../utility/GeneralUtilities';

const MetricsPage = function (props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const intl = useIntl();
  // const query = queryString.parse(location.search);
  const { teams, currentTeam } = props;
  const {
    component,
    grouping,
  } = Object.fromEntries(searchParams.entries());
  const queryStartDate = searchParams.get('startDate');
  const queryEndDate = searchParams.get('endDate');
  const [startDate, setStartDate] = useState(queryStartDate ? moment(queryStartDate) : moment().subtract(30, 'days'));
  const [endDate, setEndDate] = useState(queryEndDate ? moment(queryEndDate) : moment());
  const [groupingPeriod, setGroupingPeriod] = useState(grouping || 'week');
  const [selectedTeam, setSelectedTeam] = useState(currentTeam?._id || undefined);
  const [selectedComponent, setSelectedComponent] = useState(component || 'any');
  const [key, setKey] = useState('execution');
  // undefined = both types, which is what every pre-3.0 metrics view showed.
  const [executionType, setExecutionType] = useState(undefined);
  const [metrics, setMetrics] = useState({});
  const [platformColors, setPlatformColors] = useState({});
  const metricRequests = new MetricRequests(axios);
  const { afterToday } = DateRangePicker;

  // The shared platform chart takes a flat execution list; metrics nests them
  // under periods → phases.
  const flattenExecutions = (metricsToUse) => (
    (metricsToUse && metricsToUse.periods)
      ? metricsToUse.periods.flatMap((period) => period.phases
        .flatMap((phase) => phase.executions))
      : []
  );

  const getPlatformArrayColors = (metricsToUse) => {
    const result = { colors: [] };
    metricsToUse.periods.forEach((period) => {
      period.phases.forEach((phase) => {
        phase.executions.forEach((execution) => {
          if (execution.platforms && execution.platforms.length > 0) {
            execution.platforms.forEach((platform) => {
              const platformLabel = getPlatformLabel(platform);
              if (!result[platformLabel]) {
                // Deterministic by first-seen order → stable across renders.
                const color = getPaletteColor(result.colors.length);
                result[platformLabel] = { color };
                result.colors.push(color);
              }
            });
          }
        });
      });
    });
    return result;
  };

  const getMetrics = (teamId, componentId, fromDate, toDate, groupingId, executionTypeId) => {
    if (metrics && Object.keys(metrics).length > 0) {
      setMetrics(undefined);
    }
    metricRequests
      .getPhaseMetrics(teamId, componentId, fromDate, toDate, groupingId, executionTypeId)
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
    if (endDate && startDate && selectedTeam) {
      if (selectedComponent === 'any') {
        getMetrics(selectedTeam, undefined, startDate, endDate, groupingPeriod, executionType);
      } else {
        getMetrics(
          selectedTeam, selectedComponent, startDate, endDate, groupingPeriod, executionType,
        );
      }
    }
  };

  // The team now comes from the header picker, so this effect is the only path
  // by which the page changes team. Resetting the component filter is part of
  // that: component ids belong to a team, so one carried across a team change
  // would filter the metrics by something the new team does not have.
  useEffect(() => {
    if (currentTeam && currentTeam._id !== selectedTeam) {
      setSelectedTeam(currentTeam._id);
      setSelectedComponent('any');
    }
  }, [currentTeam, selectedTeam]);

  useEffect(() => {
    retrieveMetrics();
  }, [selectedTeam]);

  const handleGroupingChange = (groupingValue) => {
    setGroupingPeriod(groupingValue);
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
    router.push(`${pathname}?${new URLSearchParams(params).toString()}`);
    retrieveMetrics();
  };

  const getComponents = (teamId) => {
    const teamFound = teams.find((team) => team._id === teamId);
    return teamFound ? teamFound.components : [];
  };

  return (
    <div>
      <Affix
        top={20}
      >
        <Stack className="top-menu-stack" spacing={10}>
          <SelectPicker
            cleanable
            // searchable={false}
            appearance="subtle"
            label={<FormattedMessage id="page.metrics.filters.labels.component" />}
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
            label={<FormattedMessage id="page.metrics.filters.labels.period" />}
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
            label={<FormattedMessage id="page.metrics.filters.labels.group-by-period" />}
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
          <SelectPicker
            label={<FormattedMessage id="page.metrics.filters.labels.execution-type" />}
            cleanable={false}
            searchable={false}
            appearance="subtle"
            data={getExecutionTypeOptions(intl)}
            value={executionType === undefined ? ALL_EXECUTION_TYPES : executionType}
            onChange={(value) => {
              setExecutionType(toExecutionTypeParam(value));
            }}
          />
          <Button className="btn-primary" type="submit" onClick={() => { onSubmit(); }}>
            <FormattedMessage id="page.metrics.filters.button.retrieve-metrics" />
          </Button>
        </Stack>
      </Affix>
      <div className="metrics-main">
        <div className="tabs-container">
          <Tabs id="execution-metrics-tabs" activeKey={key} defaultActiveKey="execution" onSelect={(tabKey, evt) => setTab(tabKey, evt)}>
            <Tabs.Tab eventKey="execution" title={<FormattedMessage id="page.metrics.tab.execution-metrics" />}>
              {
                !metrics ? (
                  <div className="app-alert app-alert-info" role="alert">
                    <Loader />
                    <span> Retrieving metrics.</span>
                  </div>
                ) : null
              }
              {
                metrics && Object.keys(metrics).length === 0 ? (
                  <div className="app-alert app-alert-error" role="alert">
                    <span>Unable to retrieve metrics. Please refresh the page and try again.</span>
                  </div>
                ) : null
              }
              {
                metrics && Object.keys(metrics).length > 0 ? (
                  <div>
                    <Grid fluid>
                      <Row gutter={30} className="dashboard-row">
                        <Col xs={24}>
                          <ExecutionMetricsSummary metrics={metrics} />
                        </Col>
                      </Row>
                      <Row gutter={30} className="dashboard-row">
                        <Col xs={12}>
                          <ExecutionMetricsResultsBarChart
                            title={<FormattedMessage id="page.metrics.execution-metrics-bar-chart.title" />}
                            yaxisTitle={intl.formatMessage({ id: 'page.metrics.execution-metrics-bar-chart.yaxis-title' })}
                            metrics={metrics}
                          />
                        </Col>
                        <Col xs={12}>
                          <PhaseMetricsResultsBarChart
                            title={<FormattedMessage id="page.metrics.execution-metrics-phase-bar-chart.title" />}
                            yaxisTitle={intl.formatMessage({ id: 'page.metrics.execution-metrics-phase-bar-chart.yaxis-title' })}
                            metrics={metrics}
                          />
                        </Col>
                      </Row>
                    </Grid>
                  </div>
                ) : null
              }
            </Tabs.Tab>
            <Tabs.Tab eventKey="platform" title={<FormattedMessage id="page.metrics.tab.platform-metrics" />}>
              {
                !metrics ? (
                  <div className="app-alert app-alert-info" role="alert">
                    <Loader />
                    <span> Retrieving metrics.</span>
                  </div>
                ) : null
              }
              {
                metrics && Object.keys(metrics).length === 0 ? (
                  <div className="app-alert app-alert-error" role="alert">
                    <span>Unable to retrieve metrics. Please refresh the page and try again.</span>
                  </div>
                ) : null
              }
              {
                metrics && Object.keys(metrics).length > 0 ? (
                  <div>
                    <Grid fluid>
                      <Row gutter={30} className="dashboard-row">
                        <Col xs={24}>
                          <PlatformMetricsSummary
                            metrics={metrics}
                            platformColors={platformColors}
                          />
                        </Col>
                      </Row>
                      <Row gutter={30} className="dashboard-row">
                        <Col xs={12}>
                          <PlatformDistributionPieChart
                            title={<FormattedMessage id="page.metrics.platform-distribution-pie-chart.title" />}
                            metrics={metrics}
                            platformColors={platformColors}
                          />
                        </Col>
                        <Col xs={12}>
                          <PlatformStatusBarChart
                            title={<FormattedMessage id="page.metrics.platform-distribution-bar-chart.title" />}
                            yaxisTitle={intl.formatMessage({ id: 'page.metrics.platform-distribution-bar-chart.yaxis-title' })}
                            xaxisTitle={intl.formatMessage({ id: 'page.metrics.platform-distribution-bar-chart.xaxis-title' })}
                            executions={flattenExecutions(metrics)}
                            panelClassName="execution-metrics-chart-panel"
                            background="var(--sub-panel-background)"
                            foreColor="var(--sub-panel-font-color)"
                          />
                        </Col>
                      </Row>
                    </Grid>
                  </div>
                ) : null
              }
            </Tabs.Tab>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => ({
  currentTeam: state.teamsReducer.currentTeam,
  teams: state.teamsReducer.teams,
});

export default connect(mapStateToProps)(MetricsPage);
