import React, { Component } from 'react';
import axios from 'axios';
import Modal from 'react-bootstrap/Modal';
import queryString from 'query-string';
import { withRouter } from 'react-router-dom';
import { BuildRequests, ScreenshotRequests } from 'angles-javascript-client';
import BuildResultsPieChart from '../charts/BuildResultsPieChart';
import BuildFeaturePieChart from '../charts/BuildFeaturePieChart';
import SuiteTable from '../tables/SuiteTable';
import BuildSummary from '../tables/BuildSummary';
import BuildArtifacts from '../tables/BuildArtifacts';
import '../charts/Charts.css';
import './Default.css';
import ScreenshotView from './ScreenshotView';

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
  }

  getScreenshotDetails = (buildId) => {
    this.screenshotRequests.getScreenshotsForBuild(buildId)
      .then((screenshots) => {
        this.setState({ screenshots });
      });
  }

  closeModal = () => {
    this.setState({ showModal: false });
  }

  openModal = (imageId, tab) => {
    this.setState({
      showModal: true,
      currentShotId: imageId,
      selectedTab: tab,
    });
  }

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
    if (currentBuild === {}) {
      return (
        <div>
          <div className="alert alert-danger" role="alert">
            <span>Unable to retrieve build details. Please refresh the page and try again.</span>
          </div>
        </div>
      );
    }
    return (
      <div>
        <h1>
          <span>{ `Build: ${currentBuild.name}`}</span>
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
            />
          </Modal.Body>
        </Modal>
      </div>
    );
  }
}

export default withRouter(BuildPage);
