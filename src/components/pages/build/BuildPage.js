import React, { useState, useContext } from 'react';
import axios from 'axios';
import Modal from 'react-bootstrap/Modal';
import queryString from 'query-string';
import { connect } from 'react-redux';
import { saveAs } from 'file-saver';
import FileDownloadIcon from '@rsuite/icons/FileDownload';
import { BuildRequests, ScreenshotRequests } from 'angles-javascript-client';
import { useLocation } from 'react-router-dom';
import {
  Panel,
} from 'rsuite';
import BuildResultsPieChart from '../../charts/BuildResultsPieChart';
import BuildFeaturePieChart from '../../charts/BuildFeaturePieChart';
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

const BuildPage = function (props) {
  const location = useLocation();
  const [showModal, setShowModal] = useState(false);
  const [screenshots, setScreenshots] = useState(null);
  const [query] = useState(queryString.parse(location.search));
  const [currentBuild, setCurrentBuild] = useState(null);
  const [, setFilterStates] = useState([]);
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

  const filterBuilds = (statesToFilterBy) => {
    const filterSuites = [];
    currentBuild.suites.forEach((suite) => {
      const newSuite = { ...suite };
      newSuite.executions = suite.executions
        .filter((execution) => statesToFilterBy.length === 0
          || statesToFilterBy.includes(execution.status));
      filterSuites.push(newSuite);
    });
    setFilteredSuites(filterSuites);
    setFilterStates(statesToFilterBy);
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
          <Panel
            bordered
            header={(
              <span>Build Details</span>
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
            <div>{ `Component: ${currentBuild.component}` }</div>
            <div>{ `PASS: ${currentBuild.result.PASS}` }</div>
            <div>{ `FAIL: ${currentBuild.result.FAIL}` }</div>
          </Panel>
          <BuildArtifacts build={currentBuild} />
          <div className="graphContainerParent">
            <BuildResultsPieChart build={currentBuild} filterBuilds={filterBuilds} />
            <BuildFeaturePieChart build={currentBuild} />
          </div>
          <br />
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

export default connect(null, mapDispatchToProps)(BuildPage);
