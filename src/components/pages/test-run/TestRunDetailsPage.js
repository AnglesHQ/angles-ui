import React, { useState, useContext } from 'react';
import axios from 'axios';
import Modal from 'react-bootstrap/Modal';
import queryString from 'query-string';
import moment from 'moment/moment';
import { connect } from 'react-redux';
import { FormattedMessage, useIntl } from 'react-intl';
import { saveAs } from 'file-saver';
import { AiOutlineTeam, AiOutlinePartition } from 'react-icons/ai';
import { GiSandsOfTime, GiTrafficLightsGreen } from 'react-icons/gi';
import { BiSolidFlagCheckered } from 'react-icons/bi';
import {
  BsJournalCheck,
  BsJournalX,
  BsLockFill,
  BsFillUnlockFill,
} from 'react-icons/bs';
import { CgExtension } from 'react-icons/cg';
import { IoImagesSharp } from 'react-icons/io5';
import { TbTimelineEventText } from 'react-icons/tb';
import FileDownloadIcon from '@rsuite/icons/FileDownload';
import MenuIcon from '@rsuite/icons/Menu';
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
  Badge,
} from 'rsuite';
import SuiteTable from '../../common/test-suite/SuiteTable';
import BuildArtifacts from '../../common/BuildArtifacts';
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

// import ScreenshotModal from "../../common/screenshot-view/modal/ScreenhotModal";

const TestRunDetailsPage = function (props) {
  // TODO: Environment is not shown!
  const location = useLocation();
  const intl = useIntl();
  const [showModal, setShowModal] = useState(false);
  const [screenshots, setScreenshots] = useState(null);
  const [query] = useState(queryString.parse(location.search));
  const [currentBuild, setCurrentBuild] = useState(null);
  const [displayArtifacts, setDisplayArtifacts] = useState(false);
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
      return <BsJournalX className="test-run-end-icon-fail" />;
    }
    if (build.status === 'PASS') {
      return <BsJournalCheck className="test-run-end-icon-pass" />;
    }
    if (build.status === 'ERROR') {
      return <BsJournalX className="test-run-end-icon-error" />;
    }
    return <InfoRoundIcon className="test-run-end-icon-info" />;
  };

  const toggleDisplayArtifacts = () => {
    setDisplayArtifacts(!displayArtifacts);
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
                    {intl.formatMessage({ id: 'page.test-run.menu.download-report' })}
                  </Dropdown.Item>
                  <Dropdown.Item
                    icon={<BsLockFill />}
                    onClick={() => { toggleKeep(currentBuild); }}
                  >
                    {
                      (!currentBuild.keep) ? (
                        intl.formatMessage({ id: 'page.test-run.menu.enable-keep-flag' })
                      ) : (
                        intl.formatMessage({ id: 'page.test-run.menu.disable-keep-flag' })
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
                        placement="bottomStart"
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
                  <div className="test-run-steps">
                    <Steps current={3}>
                      <Steps.Item
                        title={intl.formatMessage({ id: 'page.test-run.steps-header.start' })}
                        description={moment.utc(moment(currentBuild.start)).format('DD MMM - HH:mm:ss')}
                        icon={
                          <GiTrafficLightsGreen className="test-run-step-icon" />
                        }
                      />
                      <Steps.Item
                        title={intl.formatMessage({ id: 'page.test-run.steps-header.duration' })}
                        description={getDuration(currentBuild)}
                        className="test-run-duration"
                        icon={
                          <GiSandsOfTime className="test-run-step-icon" />
                        }
                      />
                      <Steps.Item
                        title={intl.formatMessage({ id: 'page.test-run.steps-header.end' })}
                        className="test-run-end"
                        description={moment.utc(moment(currentBuild.end)).format('DD MMM - HH:mm:ss')}
                        icon={
                          <BiSolidFlagCheckered className="test-run-step-icon" />
                        }
                      />
                    </Steps>
                  </div>
                  <FlexboxGrid className="test-run-details-grid" justify="space-between">
                    <Whisper
                      placement="topStart"
                      controlId="control-id-hover"
                      trigger="hover"
                      speaker={(
                        <Tooltip>
                          {intl.formatMessage({ id: 'page.test-run.icons.team.whisper' })}
                        </Tooltip>
                      )}
                    >
                      <FlexboxGrid.Item colspan={6} className="test-run-details-grid-item">
                        <AiOutlineTeam className="test-run-details-icon" />
                        {currentBuild.team.name}
                      </FlexboxGrid.Item>
                    </Whisper>
                    <Whisper
                      placement="topStart"
                      controlId="control-id-hover"
                      trigger="hover"
                      speaker={(
                        <Tooltip>
                          {intl.formatMessage({ id: 'page.test-run.icons.component.whisper' })}
                        </Tooltip>
                      )}
                    >
                      <FlexboxGrid.Item colspan={6} className="test-run-details-grid-item">
                        <CgExtension className="test-run-details-icon" />
                        {getComponentName(currentBuild).name}
                      </FlexboxGrid.Item>
                    </Whisper>
                    <Whisper
                      placement="topEnd"
                      controlId="control-id-hover"
                      trigger="hover"
                      speaker={(
                        <Tooltip>
                          {intl.formatMessage({ id: 'page.test-run.icons.phase.whisper' })}
                        </Tooltip>
                      )}
                    >
                      <FlexboxGrid.Item colspan={6} className="test-run-details-grid-item">
                        {
                          (currentBuild.phase) ? (
                            <>
                              <TbTimelineEventText className="test-run-details-icon" />
                              {currentBuild.phase.name}
                            </>
                          ) : (
                            <>
                              <TbTimelineEventText className="test-run-details-icon-disabled" />
                              none
                            </>
                          )
                        }
                      </FlexboxGrid.Item>
                    </Whisper>
                  </FlexboxGrid>
                </Panel>
                <FlexboxGrid className="test-run-icons-grid">
                  <FlexboxGrid.Item colspan={6}>
                    <Whisper
                      placement="topStart"
                      controlId="control-id-hover"
                      trigger="hover"
                      speaker={(
                        <Tooltip>
                          {intl.formatMessage({ id: 'page.test-run.icons.artifacts.whisper' })}
                        </Tooltip>
                      )}
                    >
                      <Badge content={currentBuild.artifacts.length}>
                        {
                          (currentBuild.artifacts.length > 0) ? (
                            <AiOutlinePartition className="test-run-details-icon" onClick={toggleDisplayArtifacts} />
                          ) : (
                            <AiOutlinePartition className="test-run-details-icon-disabled" />
                          )
                        }
                      </Badge>
                    </Whisper>
                  </FlexboxGrid.Item>
                  <FlexboxGrid.Item colspan={6} onClick={() => { toggleKeep(currentBuild); }}>
                    <Whisper
                      placement="topStart"
                      controlId="control-id-hover"
                      trigger="hover"
                      speaker={(
                        <Tooltip>
                          {intl.formatMessage({ id: 'page.test-run.icons.keep-lock.whisper' })}
                        </Tooltip>
                      )}
                    >
                      <span>
                        {
                          currentBuild.keep ? <BsLockFill className="test-run-details-icon test-run-details-lock-icon" /> : <BsFillUnlockFill className="test-run-details-icon test-run-details-unlock-icon" />
                        }
                      </span>
                    </Whisper>
                  </FlexboxGrid.Item>
                  <FlexboxGrid.Item colspan={6}>
                    <Whisper
                      placement="topStart"
                      controlId="control-id-hover"
                      trigger="hover"
                      speaker={(
                        <Tooltip>
                          { intl.formatMessage({ id: 'page.test-run.icons.screenshots.whisper' }, { numberOfScreenshots: screenshots.length }) }
                        </Tooltip>
                      )}
                    >
                      <Badge content={screenshots.length}>
                        {
                          (screenshots.length > 0) ? (
                            <IoImagesSharp className="test-run-details-icon" onClick={() => { openModal(screenshots[0]._id); }} />
                          ) : (
                            <IoImagesSharp className="test-run-details-icon-disabled" />
                          )
                        }
                      </Badge>
                    </Whisper>
                  </FlexboxGrid.Item>
                  <FlexboxGrid.Item colspan={6}>
                    <Whisper
                      placement="topStart"
                      controlId="control-id-hover"
                      trigger="hover"
                      speaker={(
                        <Tooltip>
                          {intl.formatMessage({ id: 'page.test-run.icons.download-report.whisper' })}
                        </Tooltip>
                      )}
                    >
                      <FileDownloadIcon className="test-run-details-icon" disabled={!downloadReportButtonEnabled} onClick={() => { downloadReport(currentBuild._id); }} />
                    </Whisper>
                  </FlexboxGrid.Item>
                </FlexboxGrid>
                <FlexboxGrid>
                  <FlexboxGrid.Item colspan={24}>
                    {
                      displayArtifacts ? (
                        <Panel className="test-run-details-artifact-panel">
                          <BuildArtifacts build={currentBuild} />
                        </Panel>
                      ) : null
                    }
                  </FlexboxGrid.Item>
                </FlexboxGrid>
              </Col>
            </Row>
            <Row gutter={30} className="test-run-row">
              <Col xs={12}>
                <ExecutionPieChart
                  title={<FormattedMessage id="page.test-run.execution-pie-chart.title" />}
                  currentBuild={currentBuild}
                />
              </Col>
              <Col xs={12}>
                <FeaturePieChart
                  title={<FormattedMessage id="page.test-run.feature-distribution-pie-chart.title" />}
                  currentBuild={currentBuild}
                />
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
