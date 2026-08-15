import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  Loader,
  Col,
  Grid,
  Modal,
  Panel,
  Row,
} from 'rsuite';
import { useSearchParams } from 'next/navigation';
import { ExecutionRequests, ScreenshotRequests } from 'angles-javascript-client';
import TestExecutionsResultPieChart from './charts/TestExecutionsResultPieChart';
import TestExecutionTimelineChart from './charts/TestExecutionTimelineChart';
import PlatformStatusBarChart from '../../features/platform-status-chart';
import ScreenshotView from '../../features/screenshot-view/ScreenshotView';
import SuiteTable from '../../features/test-suite/SuiteTable';
import { ExecutionStateProvider } from '../../../context/ExecutionStateContext';
import { useConstructor } from '../../../utility/GeneralUtilities';
import CurrentScreenshotContext from '../../../context/CurrentScreenshotContext';
import Message from '../../common/Message';

const SummaryPage = function () {
  const intl = useIntl();
  const searchParams = useSearchParams();
  const [limit] = useState(30);
  const [currentSkip] = useState(0);
  const [executions, setExecutions] = useState([]);
  const [screenshots, setScreenshots] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState('image');
  const [suiteResult, setSuiteResult] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const query = {
    executionId: searchParams.get('executionId'),
  };
  const screenshotRequests = new ScreenshotRequests(axios);
  const executionRequests = new ExecutionRequests(axios);
  const {
    currentShotId,
    setCurrentScreenshotId,
  } = useContext(CurrentScreenshotContext);

  const getScreenshotDetails = (screenshotIds) => {
    screenshotRequests.getScreenshots(screenshotIds)
      .then((retrievedScreenshots) => {
        setScreenshots(retrievedScreenshots);
      });
  };

  const retrieveScreenshotDetailsForExecutions = (screenshotExecutions) => {
    const screenshotIdArray = [];
    screenshotExecutions.forEach((execution) => {
      execution.actions.forEach((action) => {
        action.steps.forEach((step) => {
          if (step.screenshot) screenshotIdArray.push(step.screenshot);
        });
      });
    });
    getScreenshotDetails(screenshotIdArray);
  };

  const getExecutionHistoryForExecutionId = (executionId, skip, queryLimit) => {
    executionRequests
      .getExecutionHistory(executionId, skip, queryLimit)
      .then((response) => {
        const { executions: retrievedExecutions } = response;
        retrieveScreenshotDetailsForExecutions(retrievedExecutions);
        const executionsToSave = [...retrievedExecutions];
        setExecutions(executionsToSave);
      });
  };

  useConstructor(() => {
    const { executionId } = query;
    getExecutionHistoryForExecutionId(executionId, currentSkip, limit);
  });

  const calculateSuiteResults = (suite) => {
    suite.executions.forEach((execution) => {
      // eslint-disable-next-line no-param-reassign
      suite.result[execution.status] += 1;
    });
    return suite;
  };

  const generateSuiteResult = (executionsArray, suiteName) => calculateSuiteResults({
    executions: executionsArray,
    result: {
      PASS: 0,
      FAIL: 0,
      ERROR: 0,
      SKIPPED: 0,
    },
    name: suiteName,
    status: 'N/A',
  });

  // Every chart and the table below read from this one filtered list, so
  // selecting a status in the donut narrows the whole page consistently. The
  // donut itself is always fed the UNfiltered executions — otherwise selecting
  // a status would erase the other slices and leave no way back.
  const filteredExecutions = selectedStatus
    ? executions.filter((execution) => execution.status === selectedStatus)
    : executions;

  useEffect(() => {
    if (executions.length > 0) {
      const suite = generateSuiteResult(filteredExecutions, executions[0].suite);
      setSuiteResult(suite);
    }
  }, [executions, selectedStatus]);

  const filterByStatus = (status) => {
    setSelectedStatus(status === selectedStatus ? null : status);
  };

  const clearStatusFilter = () => {
    setSelectedStatus(null);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const openModal = (imageId, tab) => {
    setShowModal(true);
    setCurrentScreenshotId(imageId);
    setSelectedTab(tab);
  };

  return (
    (executions.length === 0 || suiteResult === null) ? (
      <Message
        type="info"
        message={(
          <span>
            <Loader />
            <FormattedMessage id="page.test-execution-history.messages.retrieving-executions" />
          </span>
        )}
      />
    ) : (
      <div>
        <Grid fluid>
          <Row gutter={30} className="detail-row">
            <Col xs={24}>
              <Panel
                className="page-detail-header"
                header={(
                  <div className="page-detail-header-title">
                    {executions[0].title}
                  </div>
                )}
              >
                <span>
                  <FormattedMessage id="page.test-execution-history.header.suite" />
                </span>
                <span>: </span>
                <span>{executions[0].suite}</span>
              </Panel>
            </Col>
          </Row>
          <Row gutter={30} className="detail-row">
            <Col xs={24}>
              <div className="filter-toolbar">
                <span className="filter-toolbar-hint">
                  <FormattedMessage id="page.test-execution-history.filter.hint" />
                </span>
                {
                  selectedStatus ? (
                    <button
                      type="button"
                      className="filter-chip"
                      onClick={clearStatusFilter}
                    >
                      {/* The status word is coloured, so it is rendered as its
                          own element between the two message parts rather than
                          injected into one — embedding markup in a message
                          makes react-intl emit a keyless array and warn. */}
                      <span>
                        <FormattedMessage id="page.test-execution-history.filter.showing" />
                      </span>
                      <span className={`status-${selectedStatus.toLowerCase()}`}>
                        {selectedStatus}
                      </span>
                      <span>
                        <FormattedMessage
                          id="page.test-execution-history.filter.active"
                          values={{ count: filteredExecutions.length }}
                        />
                      </span>
                      <span className="filter-chip-clear">×</span>
                    </button>
                  ) : null
                }
              </div>
            </Col>
            <Col xs={12}>
              <TestExecutionsResultPieChart
                title={intl.formatMessage({ id: 'page.test-execution-history.charts.execution-pie-chart.title' })}
                executions={executions}
                onStatusClick={filterByStatus}
              />
            </Col>
            <Col xs={12}>
              <TestExecutionTimelineChart
                title={intl.formatMessage({ id: 'page.test-execution-history.charts.execution-timeline-chart.title' })}
                yaxisTitle={intl.formatMessage({ id: 'page.test-execution-history.charts.execution-timeline-chart.yaxis-label' })}
                executions={filteredExecutions}
              />
            </Col>
          </Row>
          <Row gutter={30} className="detail-row">
            <Col xs={24}>
              <PlatformStatusBarChart
                title={intl.formatMessage({ id: 'page.test-execution-history.charts.execution-platform-bar-chart.title' })}
                yaxisTitle={intl.formatMessage({ id: 'page.test-execution-history.charts.execution-platform-bar-chart.yaxis-title' })}
                xaxisTitle={intl.formatMessage({ id: 'page.test-execution-history.charts.execution-platform-bar-chart.xaxis-title' })}
                executions={suiteResult.executions}
              />
            </Col>
          </Row>
          <Row gutter={30} className="detail-row">
            <Col xs={24}>
              {
                filteredExecutions.length === 0 ? (
                  <div className="app-alert app-alert-info" role="alert">
                    <span>
                      <FormattedMessage id="page.test-execution-history.filter.no-results" />
                    </span>
                  </div>
                ) : (
                  <ExecutionStateProvider key={`state-provider-${suiteResult.name}-${selectedStatus || 'all'}`}>
                    <SuiteTable
                      key={`${suiteResult.name}-${selectedStatus || 'all'}`}
                      suite={suiteResult}
                      screenshots={screenshots}
                      openModal={openModal}
                      showHistoryLink={false}
                    />
                  </ExecutionStateProvider>
                )
              }
            </Col>
          </Row>
        </Grid>
        <Modal open={showModal} onClose={closeModal} className="screenshot-modal">
          <Modal.Header>
            <Modal.Title>
              <FormattedMessage id="common.component.screenshot-view.header" />
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <ScreenshotView
              buildScreenshots={screenshots}
              selectedScreenshotId={currentShotId}
              selectedTab={selectedTab}
            />
          </Modal.Body>
        </Modal>
      </div>
    )
  );
};

export default SummaryPage;
