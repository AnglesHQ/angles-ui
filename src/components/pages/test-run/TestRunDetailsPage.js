import React, { useState, useContext } from 'react';
import axios from 'axios';
import Modal from 'react-bootstrap/Modal';
import queryString from 'query-string';
import moment from 'moment/moment';
import { connect } from 'react-redux';
import { saveAs } from 'file-saver';
import FileDownloadIcon from '@rsuite/icons/FileDownload';
import TagLockIcon from '@rsuite/icons/TagLock';
import MenuIcon from '@rsuite/icons/Menu';
import TimeIcon from '@rsuite/icons/Time';
import ReviewPassIcon from '@rsuite/icons/ReviewPass';
import ReviewRefuseIcon from '@rsuite/icons/ReviewRefuse';
import InfoRoundIcon from '@rsuite/icons/InfoRound';
import { BuildRequests, ScreenshotRequests } from 'angles-javascript-client';
import { useLocation } from 'react-router-dom';
import {
  Panel,
  Row,
  Col,
  Grid,
  Steps,
  Dropdown,
  IconButton,
  FlexboxGrid,
  Whisper,
  Tooltip,
} from 'rsuite';
import SuiteTable from '../../tables/SuiteTable';
import BuildArtifacts from '../../tables/BuildArtifacts';
import ScreenshotView from '../../common/screenshot-view/ScreenshotView';
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

  // eslint-disable-next-line no-shadow
  const renderIconButton = (props, ref) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <IconButton {...props} ref={ref} icon={<MenuIcon />} />
  );

  const toggleKeep = (build) => {
    const { _id: buildId, keep } = build;
    buildRequests.setKeep(buildId, !keep)
      .then(() => {
        setCurrentBuild({ ...build, keep: !keep });
      });
  };

  const getTestRunEndIcon = (build) => {
    if (build.status === 'FAIL') {
      return <ReviewRefuseIcon className="test-run-end-icon-fail" />;
    }
    if (build.status === 'PASS') {
      return <ReviewPassIcon className="test-run-end-icon-pass" />;
    }
    if (build.status === 'ERROR') {
      return <ReviewRefuseIcon className="test-run-end-icon-error" />;
    }
    return <InfoRoundIcon className="test-run-end-icon-info" />;
  };

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
            <Row gutter={30} className="test-run-row">
              <div className="test-run-download-icon">
                <Dropdown
                  className="test-run-download-button"
                  renderToggle={renderIconButton}
                  placement="bottomEnd"
                >
                  <Dropdown.Item
                    icon={<FileDownloadIcon />}
                    disabled={!downloadReportButtonEnabled}
                    onClick={() => { downloadReport(currentBuild._id); }}
                  >
                    Download Report as HTML file
                  </Dropdown.Item>
                  <Dropdown.Item
                    icon={<TagLockIcon />}
                    onClick={() => { toggleKeep(currentBuild); }}
                  >
                    {
                      (!currentBuild.keep) ? (
                        'Enable the Keep flag.'
                      ) : (
                        'Disable the Keep flag.'
                      )
                    }
                  </Dropdown.Item>
                </Dropdown>
              </div>
              <Col xs={24}>
                <Panel
                  className="test-run-header"
                  header={(
                    <div className="test-run-header-panel">
                      <Whisper
                        placement="right"
                        controlId="control-id-hover"
                        trigger="hover"
                        speaker={(
                          <Tooltip>
                            {`Status: ${currentBuild.status}`}
                          </Tooltip>
                        )}
                      >
                        <span>{getTestRunEndIcon(currentBuild)}</span>
                      </Whisper>
                      { `${currentBuild.name}` }
                    </div>
                  )}
                >
                  <FlexboxGrid className="test-run-details-grid" justify="space-between">
                    <FlexboxGrid.Item colspan={6} className="test-run-details-grid-item">
                      <span>Team: </span>
                      {currentBuild.team.name}
                    </FlexboxGrid.Item>
                    <FlexboxGrid.Item colspan={6} className="test-run-details-grid-item">
                      <span>Component: </span>
                      {getComponentName(currentBuild).name}
                    </FlexboxGrid.Item>
                    <FlexboxGrid.Item colspan={6} className="test-run-details-grid-item">
                      <span>Phase: </span>
                      {currentBuild.phase.name}
                    </FlexboxGrid.Item>
                  </FlexboxGrid>
                  <div className="test-run-steps">
                    <Steps current={3}>
                      <Steps.Item
                        title="Start"
                        description={moment.utc(moment(currentBuild.start)).format('DD MMM - HH:mm:ss')}
                      />
                      <Steps.Item
                        title="Duration"
                        description={getDuration(currentBuild)}
                        className="test-run-duration"
                        icon={
                          <TimeIcon className="test-run-duration-icon" />
                        }
                      />
                      <Steps.Item
                        title="End"
                        className="test-run-end"
                        description={moment.utc(moment(currentBuild.end)).format('DD MMM - HH:mm:ss')}
                      />
                    </Steps>
                  </div>
                  <div>
                    <span>Components: </span>
                    <BuildArtifacts build={currentBuild} />
                  </div>
                </Panel>
              </Col>
            </Row>
            <Row gutter={30} className="test-run-row">
              <Col xs={12}>
                <ExecutionPieChart currentBuild={currentBuild} />
              </Col>
              <Col xs={12}>
                <FeaturePieChart currentBuild={currentBuild} />
              </Col>
            </Row>
            <Row gutter={30} className="test-run-row">
              <Col xs={24}>
                <div>
                  {
                    filteredSuites.map((suite, index) => (
                      suite.executions.length > 0 ? (
                        <ExecutionStateProvider key={`state-provider-${suite.name}`}>
                          <SuiteTable
                            key={`${suite.name}`}
                            index={index}
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
