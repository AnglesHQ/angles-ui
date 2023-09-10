import React, { useState, useContext } from 'react';
import axios from 'axios';
import Modal from 'react-bootstrap/Modal';
import queryString from 'query-string';
import moment from 'moment/moment';
import { connect } from 'react-redux';
import { saveAs } from 'file-saver';
import FileDownloadIcon from '@rsuite/icons/FileDownload';
import { BuildRequests, ScreenshotRequests } from 'angles-javascript-client';
import { useLocation } from 'react-router-dom';
import {
  Panel,
  Row,
  Col,
  Grid,
  Steps,
} from 'rsuite';
import SuiteTable from '../../tables/SuiteTable';
import BuildArtifacts from '../../tables/BuildArtifacts';
import ScreenshotView from '../ScreenshotView';
import {
  clearCurrentLoaderMessage,
  storeCurrentLoaderMessage,
} from '../../../redux/notificationActions';
import { ExecutionStateProvider } from '../../../context/ExecutionStateContext';
import { useConstructor } from '../../../utility/GeneralUtilities';
import CurrentScreenshotContext from '../../../context/CurrentScreenshotContext';
import { getDuration } from '../../../utility/TimeUtilities';
import ExecutionPieChart from './charts/ExecutionPieChart';
import FeaturePieChart from './charts/FeaturePieChart';

const TestRunDetailsPage = function (props) {
  const location = useLocation();
  const [showModal, setShowModal] = useState(false);
  const [screenshots, setScreenshots] = useState(null);
  const [query] = useState(queryString.parse(location.search));
  const [currentBuild, setCurrentBuild] = useState(null);
  // const [, setFilterStates] = useState([]);
  const [filteredSuites, setFilteredSuites] = useState(null);
  const [downloadReportButtonEnabled, setDownloadReportButtonEnabled] = useState(true);
  const [selectedTab, setSelectedTab] = useState(query.selectedTab || 'image');
  const buildRequests = new BuildRequests(axios);
  const screenshotRequests = new ScreenshotRequests(axios);
  const {
    setCurrentScreenshotId,
  } = useContext(CurrentScreenshotContext);
  const getBuildDetails = (buildId) => {
    buildRequests.getBuild(buildId)
      .then((retrievedBuild) => {
        setCurrentBuild(retrievedBuild);
        setFilteredSuites(retrievedBuild.suites);
      })
      .catch(() => {
        setCurrentBuild({});
      });
  };

  const getScreenshotDetails = async (buildId) => new Promise((resolve, reject) => {
    screenshotRequests.getScreenshotsForBuild(buildId)
      .then((retrievedScreenshots) => {
        setScreenshots(retrievedScreenshots);
        resolve(retrievedScreenshots);
      })
      .catch((error) => {
        setScreenshots({});
        reject(error);
      });
  });

  const closeModal = () => {
    setShowModal(false);
  };

  const openModal = (imageId, tab) => {
    setShowModal(true);
    setCurrentScreenshotId(imageId);
    setSelectedTab(tab);
  };

  useConstructor(() => {
    getBuildDetails(query.buildId);
    getScreenshotDetails(query.buildId)
      .then(() => {
        if (query.loadScreenshotId) {
          if (query.selectedTab) {
            openModal(query.loadScreenshotId, query.selectedTab);
          } else {
            openModal(query.loadScreenshotId);
          }
        }
      });
  });

  // const filterBuilds = (statesToFilterBy) => {
  //   const filterSuites = [];
  //   currentBuild.suites.forEach((suite) => {
  //     const newSuite = { ...suite };
  //     newSuite.executions = suite.executions
  //       .filter((execution) => statesToFilterBy.length === 0
  //         || statesToFilterBy.includes(execution.status));
  //     filterSuites.push(newSuite);
  //   });
  //   setFilteredSuites(filterSuites);
  //   setFilterStates(statesToFilterBy);
  // };

  const addImageToBuildScreenshots = (screenshot) => {
    screenshots.push(screenshot);
    setScreenshots(screenshots);
  };

  const removeImageFromBuildScreenshots = (screenshotToRemove) => {
    const index = screenshots.findIndex((screenshot) => screenshot._id === screenshotToRemove._id);
    if (index > -1) {
      setScreenshots(screenshots.splice(index, 1));
    }
  };

  const downloadReport = (buildId) => {
    const { storeLoaderMessage, clearLoaderMessage } = props;
    setDownloadReportButtonEnabled(false);
    storeLoaderMessage({ title: 'Generating Report', body: `Generating html report for build with id ${buildId}` });
    buildRequests.getBuildReport(buildId)
      .then((response) => {
        saveAs(new Blob([response], { type: 'text/html' }), `${buildId}.html`);
      })
      .finally(() => {
        clearLoaderMessage();
        setDownloadReportButtonEnabled(true);
      });
  };

  const getComponentName = (build) => build.team.components
    .find((component) => component._id === build.component);

  return (
    // eslint-disable-next-line no-nested-ternary
    (!currentBuild || !screenshots) ? (
      <div className="alert alert-primary" role="alert">
        <span>
          <i className="fas fa-spinner fa-pulse fa-2x" />
          <span> Retrieving build details.</span>
        </span>
      </div>
    ) : (
      (Object.keys(currentBuild).length === 0) ? (
        <div>
          <div className="alert alert-danger" role="alert">
            <span>
              {
                'Unable to retrieve build details. '
                + 'Please refresh the page and try again and/or check if the build id is valid.'
              }
            </span>
          </div>
        </div>
      ) : (
        <div>
          <Grid fluid>
            <Row gutter={30} className="test-run-header">
              <Col xs={24}>
                <Panel
                  bordered
                  header={(
                    <span>{currentBuild.name}</span>
                  )}
                >
                  <div>
                    <span>{ `Name: ${currentBuild.name}` }</span>
                    <button
                      id="report-download"
                      type="button"
                      disabled={!downloadReportButtonEnabled}
                      onClick={() => { downloadReport(currentBuild._id); }}
                    >
                      <FileDownloadIcon />
                    </button>
                  </div>
                  <div>{ `Component: ${getComponentName(currentBuild).name}` }</div>
                  <div>
                    <Steps current={3}>
                      <Steps.Item title="Start" description={moment.utc(moment(currentBuild.start)).format('DD-MM-YYYY HH:mm:ss')} />
                      <Steps.Item title="Duration" description={getDuration(currentBuild)} />
                      <Steps.Item title="End" description={moment.utc(moment(currentBuild.end)).format('DD-MM-YYYY HH:mm:ss')} />
                    </Steps>
                  </div>
                </Panel>
              </Col>
            </Row>
            <Row gutter={30} className="dashboard-header">
              <Col xs={24}>
                <BuildArtifacts build={currentBuild} />
              </Col>
            </Row>
            <Row gutter={30} className="dashboard-header">
              <Col xs={12}>
                <ExecutionPieChart currentBuild={currentBuild} />
              </Col>
              <Col xs={12}>
                <FeaturePieChart currentBuild={currentBuild} />
              </Col>
            </Row>
            <Row gutter={30} className="dashboard-header">
              <Col xs={24}>
                <div>
                  {
                    filteredSuites.map((suite) => (
                      suite.executions.length > 0 ? (
                        <ExecutionStateProvider key={`state-provider-${suite.name}`}>
                          <SuiteTable
                            key={`${suite.name}`}
                            suite={suite}
                            screenshots={screenshots}
                            openModal={openModal}
                          />
                        </ExecutionStateProvider>
                      ) : null
                    ))
                  }
                </div>
              </Col>
            </Row>
          </Grid>
          <Modal show={showModal} onHide={closeModal} dialogClassName="screenshot-modal">
            <Modal.Header closeButton>
              <Modal.Title>Screenshot Viewer</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <ScreenshotView
                buildScreenshots={screenshots}
                selectedTab={selectedTab}
                addImageToBuildScreenshots={addImageToBuildScreenshots}
                removeImageFromBuildScreenshots={removeImageFromBuildScreenshots}
              />
            </Modal.Body>
          </Modal>
        </div>
      )
    )
  );
};

const mapDispatchToProps = (dispatch) => ({
  storeLoaderMessage: (currentLoaderMessage) => dispatch(
    storeCurrentLoaderMessage(currentLoaderMessage),
  ),
  clearLoaderMessage: () => dispatch(clearCurrentLoaderMessage()),
});

export default connect(null, mapDispatchToProps)(TestRunDetailsPage);
