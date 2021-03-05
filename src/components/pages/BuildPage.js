import React, { Component } from 'react';
import axios from 'axios';
import Modal from 'react-bootstrap/Modal';
import queryString from 'query-string';
import { withRouter } from 'react-router-dom';
import BuildResultsPieChart from '../charts/BuildResultsPieChart';
import BuildFeaturePieChart from '../charts/BuildFeaturePieChart';
import SuiteTable from '../tables/SuiteTable';
import BuildSummary from '../tables/BuildSummary';
import BuildArtifacts from '../tables/BuildArtifacts';
import '../charts/Charts.css';
import ScreenshotView from './ScreenshotView';
import makeGetScreenshotDetails from '../../utility/requests/ScreenshotRequests';

class BuildPage extends Component {
  constructor(props) {
    super(props);
    const { location } = this.props;
    this.state = {
      showModal: false,
      currentShotId: null,
      screenshots: null,
      query: queryString.parse(location.search),
    };
    const { query } = this.state;
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
    axios.get(`/build/${buildId}`)
      .then((res) => res.data)
      .then((data) => {
        this.setState({ currentBuild: data });
      })
      .catch(() => {
        this.setState({ currentBuild: {} });
      });
  }

  getScreenshotDetails = (buildId) => {
    makeGetScreenshotDetails(buildId)
      .then((res) => {
        this.setState({ screenshots: res.data });
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

  render() {
    const {
      currentBuild,
      screenshots,
      showModal,
      currentShotId,
      selectedTab,
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
          <span>Build: </span>
          <span>{currentBuild.name}</span>
        </h1>
        <BuildSummary build={currentBuild} />
        <BuildArtifacts build={currentBuild} />
        <div className="graphContainerParent">
          <BuildResultsPieChart build={currentBuild} />
          <BuildFeaturePieChart build={currentBuild} />
        </div>
        <br />
        <div>
          {
            currentBuild.suites.map((suite) => (
              <SuiteTable
                key={`${suite.name}`}
                suite={suite}
                screenshots={screenshots}
                openModal={this.openModal}
              />
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
