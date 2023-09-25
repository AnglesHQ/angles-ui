import React, { useEffect, useState } from 'react';
import axios from 'axios';
import queryString from 'query-string';
import Modal from 'react-bootstrap/Modal';
import { useLocation } from 'react-router-dom';
import { ExecutionRequests, ScreenshotRequests } from 'angles-javascript-client';
import ExecutionsResultsPieChart from '../../charts/ExecutionsResultsPieChart';
import ExecutionsTimeLineChart from '../../charts/ExecutionsTimeLineChart';
import ScreenshotView from '../../common/screenshot-view/ScreenshotView';
// import '../charts/Charts.css';
import SuiteTable from '../../tables/SuiteTable';
import { ExecutionStateProvider } from '../../../context/ExecutionStateContext';
import { useConstructor } from '../../../utility/GeneralUtilities';

const SummaryPage = function () {
  const location = useLocation();
  const [limit] = useState(30);
  const [currentSkip] = useState(0);
  const [executions, setExecutions] = useState([]);
  const [screenshots, setScreenshots] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentShotId, setCurrentShotId] = useState(null);
  const [selectedTab, setSelectedTab] = useState('image');
  const [suiteResult, setSuiteResult] = useState(null);
  const [query] = useState(queryString.parse(location.search));
  const screenshotRequests = new ScreenshotRequests(axios);
  const executionRequests = new ExecutionRequests(axios);

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

  const generateSuiteResult = (executionsArray) => calculateSuiteResults({
    executions: executionsArray,
    result: {
      PASS: 0,
      FAIL: 0,
      ERROR: 0,
      SKIPPED: 0,
    },
    name: executionsArray[0].suite,
    status: 'N/A',
  });

  useEffect(() => {
    if (executions.length > 0) {
      const suite = generateSuiteResult(executions);
      setSuiteResult(suite);
    }
  }, [executions]);

  const closeModal = () => {
    setShowModal(false);
  };

  const openModal = (imageId, tab) => {
    setShowModal(true);
    setCurrentShotId(imageId);
    setSelectedTab(tab);
  };

  return (
    (executions.length === 0 || suiteResult === null) ? (
      <div className="alert alert-primary" role="alert">
        <span>
          <i className="fas fa-spinner fa-pulse fa-2x" />
          <span> Retrieving executions.</span>
        </span>
      </div>
    ) : (
      <div>
        <h1>
          <span>History: </span>
          <span>{executions[0].title}</span>
        </h1>
        <div>
          <span>Suite: </span>
          <span>{executions[0].suite}</span>
        </div>
        <div className="graphContainerParent">
          <ExecutionsResultsPieChart executions={executions} />
          <ExecutionsTimeLineChart executions={executions} />
        </div>
        <ExecutionStateProvider key={`state-provider-${suiteResult.name}`}>
          <SuiteTable
            key={`${suiteResult.name}`}
            suite={suiteResult}
            screenshots={screenshots}
            openModal={openModal}
          />
        </ExecutionStateProvider>
        <Modal show={showModal} onHide={closeModal} dialogClassName="screenshot-modal">
          <Modal.Header closeButton>
            <Modal.Title>Screenshot Viewer</Modal.Title>
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
