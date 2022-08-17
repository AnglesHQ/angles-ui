import React, { Component } from 'react';
import axios from 'axios';
import Modal from 'react-bootstrap/Modal';
import queryString from 'query-string';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { saveAs } from 'file-saver';
import { BuildRequests, ScreenshotRequests } from 'angles-javascript-client';
import BuildResultsPieChart from '../charts/BuildResultsPieChart';
import BuildFeaturePieChart from '../charts/BuildFeaturePieChart';
import SuiteTable from '../tables/SuiteTable';
import BuildSummary from '../tables/BuildSummary';
import BuildArtifacts from '../tables/BuildArtifacts';
import '../charts/Charts.css';
import './Default.css';
import ScreenshotView from './ScreenshotView';
import {
  clearCurrentLoaderMessage,
  storeCurrentLoaderMessage,
} from '../../redux/notificationActions';

class BuildPage extends Component {
  constructor(props) {
    super(props);
    const { location } = this.props;
    this.state = {
      showModal: false,
      currentShotId: null,
      screenshots: null,
      query: queryString.parse(location.search),
      currentBuild: null,
      filterStates: [],
      filteredSuites: null,
      downloadReportButtonEnabled: true,
    };
    const { query } = this.state;
    this.buildRequests = new BuildRequests(axios);
    this.screenshotRequests = new ScreenshotRequests(axios);
    this.getBuildDetails(query.buildId);
    this.getScreenshotDetails(query.buildId);
    this.closeModal = this.closeModal.bind(this);
  }

  componentDidMount() {
    const { query } = this.state;
    if (query.loadScreenshotId) {
      if (query.selectedTab) {
        this.openModal(query.loadScreenshotId, query.selectedTab);
      } else {
        this.openModal(query.loadScreenshotId);
      }
    }
  }

  getBuildDetails = (buildId) => {
    this.buildRequests.getBuild(buildId)
      .then((currentBuild) => {
        this.setState({ currentBuild, filteredSuites: currentBuild.suites });
      })
      .catch(() => {
        this.setState({ currentBuild: {} });
      });
  };

  getScreenshotDetails = (buildId) => {
    this.screenshotRequests.getScreenshotsForBuild(buildId)
      .then((screenshots) => {
        this.setState({ screenshots });
      })
      .catch(() => {
        this.setState({ screenshots: {} });
      });
  };

  closeModal = () => {
    this.setState({ showModal: false });
  };

  openModal = (imageId, tab) => {
    this.setState({
      showModal: true,
      currentShotId: imageId,
      selectedTab: tab,
    });
  };

  filterBuilds = (filterStates) => {
    const filteredSuites = [];
    const { currentBuild } = this.state;
    currentBuild.suites.forEach((suite) => {
      const newSuite = { ...suite };
      newSuite.executions = suite.executions
        .filter((execution) => filterStates.length === 0
          || filterStates.includes(execution.status));
      filteredSuites.push(newSuite);
    });
    this.setState({ filteredSuites, filterStates });
  };

  addImageToBuildScreenshots = (screenshot) => {
    const { screenshots } = this.state;
    screenshots.push(screenshot);
    this.setState({
      screenshots,
    });
  }

  removeImageFromBuildScreenshots = (screenshotToRemove) => {
    const { screenshots } = this.state;
    const index = screenshots.findIndex((screenshot) => screenshot._id === screenshotToRemove._id);
    if (index > -1) {
      this.setState(screenshots.splice(index, 1));
    }
  }

  downloadReport = (buildId) => {
    const { storeLoaderMessage, clearLoaderMessage } = this.props;
    this.setState({ downloadReportButtonEnabled: false });
    storeLoaderMessage({ title: 'Generating Report', body: `Generating html report for build with id ${buildId}` });
    this.buildRequests.getBuildReport(buildId)
      .then((response) => {
        saveAs(new Blob([response], { type: 'text/html' }), `${buildId}.html`);
      })
      .finally(() => {
        clearLoaderMessage();
        this.setState({ downloadReportButtonEnabled: true });
      });
  }

  render() {
    const {
      currentBuild,
      screenshots,
      showModal,
      currentShotId,
      selectedTab,
      filteredSuites,
      // eslint-disable-next-line no-unused-vars
      filterStates,
      downloadReportButtonEnabled,
    } = this.state;
    if (!currentBuild || !screenshots) {
      return (
        <div className="alert alert-primary" role="alert">
          <span>
            <i className="fas fa-spinner fa-pulse fa-2x" />
            <span> Retrieving build details.</span>
          </span>
        </div>
      );
    }
    if (Object.keys(currentBuild).length === 0) {
      return (
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
      );
    }
    return (
      <div>
        <h1>
          <span>
            { `Build: ${currentBuild.name}`}
          </span>
          <button
            id="report-download"
            type="button"
            disabled={!downloadReportButtonEnabled}
            onClick={() => { this.downloadReport(currentBuild._id); }}
          >
            <i className="fa-solid fa-file-arrow-down" />
          </button>
        </h1>
        <BuildSummary build={currentBuild} screenshots={screenshots} openModal={this.openModal} />
        <BuildArtifacts build={currentBuild} />
        <div className="graphContainerParent">
          <BuildResultsPieChart build={currentBuild} filterBuilds={this.filterBuilds} />
          <BuildFeaturePieChart build={currentBuild} />
        </div>
        <br />
        <div>
          {
            filteredSuites.map((suite) => (
              suite.executions.length > 0 ? (
                <SuiteTable
                  key={`${suite.name}`}
                  suite={suite}
                  screenshots={screenshots}
                  openModal={this.openModal}
                />
              ) : null
            ))
          }
        </div>
        <Modal show={showModal} onHide={this.closeModal} dialogClassName="screenshot-modal">
          <Modal.Header closeButton>
            <Modal.Title>Screenshot Viewer</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <ScreenshotView
              buildScreenshots={screenshots}
              selectedScreenshotId={currentShotId}
              selectedTab={selectedTab}
              addImageToBuildScreenshots={this.addImageToBuildScreenshots}
              removeImageFromBuildScreenshots={this.removeImageFromBuildScreenshots}
            />
          </Modal.Body>
        </Modal>
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch) => ({
  storeLoaderMessage: (currentLoaderMessage) => dispatch(
    storeCurrentLoaderMessage(currentLoaderMessage),
  ),
  clearLoaderMessage: () => dispatch(clearCurrentLoaderMessage()),
});

export default withRouter(connect(null, mapDispatchToProps)(BuildPage));
