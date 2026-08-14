import React, { useState, useContext } from 'react';
import axios from 'axios';
import queryString from 'query-string';
import moment from 'moment/moment';
import { connect } from 'react-redux';
import { FormattedMessage, useIntl } from 'react-intl';
import { saveAs } from 'file-saver';
import { AiOutlineTeam, AiOutlinePartition } from 'react-icons/ai';
import { GiSandsOfTime, GiTrafficLightsGreen } from 'react-icons/gi';
import { BiSolidFlagCheckered } from 'react-icons/bi';
import { PiMapPinDuotone } from 'react-icons/pi';

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
import TrashIcon from '@rsuite/icons/Trash';
import { BuildRequests, ScreenshotRequests } from 'angles-javascript-client';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Panel,
  Row,
  Col,
  Grid,
  Dropdown,
  IconButton,
  Whisper,
  Tooltip,
  Loader,
  Message,
  Modal,
  useToaster,
} from 'rsuite';
import SuiteTable from '../../features/test-suite/SuiteTable';
import BuildArtifacts from '../../common/BuildArtifacts';
import ScreenshotView from '../../features/screenshot-view/ScreenshotView';
import ConfirmModal from '../../common/ConfirmModal';
import {
  clearCurrentLoaderMessage,
  storeCurrentLoaderMessage,
} from '../../../redux/notificationActions';
import { ExecutionStateProvider } from '../../../context/ExecutionStateContext';
import { useConstructor } from '../../../utility/GeneralUtilities';
import { useAuth } from '../../../context/AuthContext';
import CurrentScreenshotContext from '../../../context/CurrentScreenshotContext';
import { getDuration } from '../../../utility/TimeUtilities';
import TestRunExecutionDonutChart from './charts/TestRunExecutionDonutChart';
import FeatureDistributionBarChart from './charts/FeatureDistributionBarChart';


const TestRunDetailsPage = function (props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const intl = useIntl();
  const toaster = useToaster();
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [screenshots, setScreenshots] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const query = {
    buildId: searchParams.get('buildId'),
    loadScreenshotId: searchParams.get('loadScreenshotId'),
    selectedTab: searchParams.get('selectedTab'),
  };

  const [currentBuild, setCurrentBuild] = useState(null);
  const [displayArtifacts, setDisplayArtifacts] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
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

  const filterByStatus = (status) => {
    if (!status || status === selectedStatus) {
      // Deselect: show all
      setSelectedStatus(null);
      setFilteredSuites(currentBuild.suites);
    } else {
      setSelectedStatus(status);
      const filtered = currentBuild.suites.map((suite) => ({
        ...suite,
        executions: suite.executions.filter((execution) => execution.status === status),
      }));
      setFilteredSuites(filtered);
    }
  };

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

  const canDeleteBuild = (build) => {
    if (!user || !build || !build.team) {
      return false;
    }
    if (user.userType === 'admin') {
      return true;
    }
    if (user.userType === 'team_lead' && Array.isArray(user.teams)) {
      return user.teams
        .map((team) => (typeof team === 'object' ? team._id : team))
        .includes(build.team._id);
    }
    return false;
  };

  const handleDeleteBuild = () => {
    setDeleteConfirmOpen(true);
  };

  const handleCancelDeleteBuild = () => {
    setDeleteConfirmOpen(false);
  };

  const handleConfirmDeleteBuild = () => {
    setDeleteConfirmOpen(false);
    buildRequests.deleteBuild(currentBuild._id)
      .then(() => {
        toaster.push(
          <Message type="success">
            {intl.formatMessage({ id: 'page.test-run.toast.delete-build-success' })}
          </Message>,
          { placement: 'topEnd' },
        );
        router.push('/');
      })
      .catch(() => {
        toaster.push(
          <Message type="error">
            {intl.formatMessage({ id: 'page.test-run.toast.delete-build-error' })}
          </Message>,
          { placement: 'topEnd' },
        );
      });
  };

  const getTestRunEndIcon = (build) => {
    if (build.status === 'FAIL') {
      return <BsJournalX className="test-run-end-icon status-fail" />;
    }
    if (build.status === 'PASS') {
      return <BsJournalCheck className="test-run-end-icon status-pass" />;
    }
    if (build.status === 'ERROR') {
      return <BsJournalX className="test-run-end-icon status-error" />;
    }
    return <InfoRoundIcon className="test-run-end-icon status-info" />;
  };

  const toggleDisplayArtifacts = () => {
    setDisplayArtifacts(!displayArtifacts);
  };

  const countExecutions = (build) => (build.suites || [])
    .reduce((total, suite) => total + (suite.executions ? suite.executions.length : 0), 0);

  // One labelled cell of the metadata strip. A null value renders the cell in a
  // muted "not set" state rather than dropping it, so the strip keeps its rhythm.
  const renderFact = (labelId, icon, value, modifierClass = '') => (
    <div className={`test-run-fact ${value ? '' : 'test-run-fact-empty'} ${modifierClass}`} key={labelId}>
      <span className="test-run-fact-icon">{icon}</span>
      <span className="test-run-fact-body">
        <span className="test-run-fact-label">
          <FormattedMessage id={labelId} />
        </span>
        <span className="test-run-fact-value">
          {value || <FormattedMessage id="page.test-run.header.fact.not-set" />}
        </span>
      </span>
    </div>
  );

  // Header action icon. `onClick` of null renders it inert; `count` adds a
  // badge; `active` marks a toggled-on state. A disabled <button> swallows
  // mouse events, which would suppress the tooltip, so inert actions stay
  // enabled and are marked with aria-disabled + a "no-op" class instead.
  const renderHeaderAction = (whisperId, icon, onClick, count = null, active = false) => (
    <Whisper
      placement="bottom"
      controlId="control-id-hover"
      trigger="hover"
      speaker={(
        <Tooltip>
          {intl.formatMessage({ id: whisperId }, { numberOfScreenshots: screenshots.length })}
        </Tooltip>
      )}
    >
      <button
        type="button"
        className={`test-run-action ${active ? 'test-run-action-active' : ''} ${onClick ? '' : 'test-run-action-disabled'}`}
        aria-disabled={!onClick}
        onClick={onClick || undefined}
      >
        {icon}
        {count ? <span className="test-run-action-count">{count}</span> : null}
      </button>
    </Whisper>
  );

  const totalExecutions = countExecutions(currentBuild || {});

  return (
    // eslint-disable-next-line no-nested-ternary
    (!currentBuild || !screenshots) ? (
      <div className="app-alert app-alert-info" role="alert">
        <Loader />
        <span><FormattedMessage id="page.test-run.loading" /></span>
      </div>
    ) : (
      (Object.keys(currentBuild).length === 0) ? (
        <div>
          <div className="app-alert app-alert-error" role="alert">
            <span><FormattedMessage id="page.test-run.error.load-failed" /></span>
          </div>
        </div>
      ) : (
        <div>
          <Grid fluid>
            <Row gutter={30} className="detail-row test-run-header-row">
              <Col xs={24}>
                <div className="test-run-header">
                  {/* Identity row: status + name on the left, actions on the right. */}
                  <div className="test-run-identity">
                    <Whisper
                      placement="bottomStart"
                      controlId="control-id-hover"
                      trigger="hover"
                      speaker={(
                        <Tooltip>
                          <FormattedMessage
                            id="page.test-run.header.status.whisper"
                            values={{ status: currentBuild.status }}
                          />
                        </Tooltip>
                      )}
                    >
                      <span className="test-run-identity-icon">
                        {getTestRunEndIcon(currentBuild)}
                      </span>
                    </Whisper>
                    <div className="test-run-identity-text">
                      <h1 className="test-run-title" title={currentBuild.name}>
                        {currentBuild.name}
                      </h1>
                      <div className="test-run-identity-meta">
                        <span
                          className={`test-run-status-pill status-bg-${currentBuild.status.toLowerCase()}`}
                        >
                          {currentBuild.status}
                        </span>
                        <span className="test-run-identity-count">
                          <FormattedMessage
                            id="page.test-run.header.execution-count"
                            values={{ count: totalExecutions }}
                          />
                        </span>
                      </div>
                    </div>
                    <div className="test-run-actions">
                      {renderHeaderAction(
                        'page.test-run.icons.artifacts.whisper',
                        <AiOutlinePartition />,
                        currentBuild.artifacts.length > 0 ? toggleDisplayArtifacts : null,
                        currentBuild.artifacts.length,
                        displayArtifacts,
                      )}
                      {renderHeaderAction(
                        'page.test-run.icons.screenshots.whisper',
                        <IoImagesSharp />,
                        screenshots.length > 0 ? () => openModal(screenshots[0]._id) : null,
                        screenshots.length,
                      )}
                      {renderHeaderAction(
                        'page.test-run.icons.keep-lock.whisper',
                        currentBuild.keep ? <BsLockFill /> : <BsFillUnlockFill />,
                        () => toggleKeep(currentBuild),
                        null,
                        currentBuild.keep,
                      )}
                      {renderHeaderAction(
                        'page.test-run.icons.download-report.whisper',
                        <FileDownloadIcon />,
                        downloadReportButtonEnabled
                          ? () => downloadReport(currentBuild._id) : null,
                      )}
                      <Dropdown
                        className="test-run-menu"
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
                        {canDeleteBuild(currentBuild) && (
                          <Dropdown.Item
                            icon={<TrashIcon />}
                            onClick={() => handleDeleteBuild()}
                          >
                            {intl.formatMessage({ id: 'page.test-run.menu.delete-build' })}
                          </Dropdown.Item>
                        )}
                      </Dropdown>
                    </div>
                  </div>
                  {/* Metadata strip: one labelled cell per fact, wraps on narrow screens. */}
                  <div className="test-run-facts">
                    {renderFact(
                      'page.test-run.icons.environment.whisper',
                      <PiMapPinDuotone />,
                      currentBuild.environment.name,
                    )}
                    {renderFact(
                      'page.test-run.icons.component.whisper',
                      <CgExtension />,
                      getComponentName(currentBuild).name,
                    )}
                    {renderFact(
                      'page.test-run.icons.team.whisper',
                      <AiOutlineTeam />,
                      currentBuild.team.name,
                    )}
                    {renderFact(
                      'page.test-run.icons.phase.whisper',
                      <TbTimelineEventText />,
                      currentBuild.phase ? currentBuild.phase.name : null,
                    )}
                    {renderFact(
                      'page.test-run.steps-header.start',
                      <GiTrafficLightsGreen />,
                      moment.utc(moment(currentBuild.start)).format('DD MMM - HH:mm:ss'),
                    )}
                    {renderFact(
                      'page.test-run.steps-header.duration',
                      <GiSandsOfTime />,
                      getDuration(currentBuild),
                      'test-run-fact-emphasis',
                    )}
                    {renderFact(
                      'page.test-run.steps-header.end',
                      <BiSolidFlagCheckered />,
                      moment.utc(moment(currentBuild.end)).format('DD MMM - HH:mm:ss'),
                    )}
                  </div>
                  {
                    displayArtifacts ? (
                      <div className="test-run-artifacts">
                        <div className="test-run-artifacts-title">
                          <FormattedMessage id="page.test-run.header.artifacts-title" />
                        </div>
                        <BuildArtifacts build={currentBuild} />
                      </div>
                    ) : null
                  }
                </div>
              </Col>
            </Row>
            <Row gutter={30} className="detail-row">
              <Col xs={12}>
                <TestRunExecutionDonutChart
                  title={<FormattedMessage id="page.test-run.execution-pie-chart.title" />}
                  currentBuild={currentBuild}
                  onStatusClick={filterByStatus}
                />
              </Col>
              <Col xs={12}>
                <FeatureDistributionBarChart
                  title={<FormattedMessage id="page.test-run.feature-distribution-pie-chart.title" />}
                  currentBuild={currentBuild}
                />
              </Col>
            </Row>
            <Row gutter={30} className="detail-row">
              <Col xs={24}>
                <div className="test-run-suites-toolbar">
                  <span className="page-section-title test-run-suites-title">
                    <FormattedMessage id="page.test-run.suites.title" />
                  </span>
                  {
                    selectedStatus ? (
                      <button
                        type="button"
                        className="test-run-filter-chip"
                        onClick={() => filterByStatus(selectedStatus)}
                      >
                        <span className={`status-${selectedStatus.toLowerCase()}`}>
                          {selectedStatus}
                        </span>
                        <span className="test-run-filter-chip-clear">×</span>
                      </button>
                    ) : null
                  }
                </div>
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
          <Modal open={showModal} onClose={closeModal} className="screenshot-modal">
            <Modal.Header>
              <Modal.Title>
                <FormattedMessage id="common.component.screenshot-view.header" />
              </Modal.Title>
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
          <ConfirmModal
            open={deleteConfirmOpen}
            title={<FormattedMessage id="page.test-run.confirm.delete-build.title" />}
            message={<FormattedMessage id="page.test-run.confirm.delete-build.message" />}
            confirmLabel={<FormattedMessage id="page.test-run.menu.delete-build" />}
            cancelLabel={<FormattedMessage id="page.test-run.confirm.delete-build.cancel" />}
            onConfirm={handleConfirmDeleteBuild}
            onCancel={handleCancelDeleteBuild}
          />
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
