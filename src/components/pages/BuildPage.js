import React, { Component } from 'react'
import axios from 'axios';
import BuildResultsPieChart from '../charts/BuildResultsPieChart';
import BuildFeaturePieChart from '../charts/BuildFeaturePieChart';
import SuiteTable from '../tables/SuiteTable';
import BuildSummary from '../tables/BuildSummary';
import BuildArtifacts from '../tables/BuildArtifacts';
import '../charts/Charts.css'
import queryString from 'query-string';
import ScreenshotView from "./ScreenshotView";
import Modal from 'react-bootstrap/Modal';

class BuildPage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      currentShotId: null,
      screenshots: null,
      query: queryString.parse(this.props.location.search),
    };
    this.getBuildDetails(this.state.query.buildId);
    this.getScreenshotDetails(this.state.query.buildId);
    this.closeModal = this.closeModal.bind(this);
  }

  getBuildDetails = (buildId) => {
    axios.get('/build/' + buildId)
    .then(res => res.data)
    .then((data) => {
      this.setState({ currentBuild: data });
    })
    .catch((err) => {
        this.setState({ currentBuild: {} })
    });
  }

  getScreenshotDetails = (buildId) => {
    return axios.get(`/screenshot/?buildId=${buildId}&limit=100`)
    .then((res) => {
      this.setState({ screenshots: res.data });
    })
  }

  componentDidMount() {
    if (this.state.query.loadScreenshotId) {
      if (this.state.query.selectedTab) {
        this.openModal(this.state.query.loadScreenshotId, this.state.query.selectedTab);
      } else {
        this.openModal(this.state.query.loadScreenshotId);
      }
    }
  }

  closeModal = () => {
    this.setState({showModal: false})
  }

  openModal = (imageId, tab) => {
    this.setState({
      showModal: true,
      currentShotId: imageId,
      selectedTab: tab
    })
  }

  render() {
    if (!this.state.currentBuild || !this.state.screenshots ) {
      return <div className="alert alert-primary" role="alert">
          <span><i className="fas fa-spinner fa-pulse fa-2x"></i> Retrieving build details.</span>
        </div>
    }
    if (this.state.currentBuild === {}) {
      return <div>
        <div className="alert alert-danger" role="alert">
            <span>Unable to retrieve build details. Please refresh the page and try again.</span>
        </div>
      </div>
    }
    return (
      <div >
        <h1>Build: {this.state.currentBuild.name}</h1>
        <BuildSummary build={this.state.currentBuild} />
        <BuildArtifacts build={this.state.currentBuild} />
        <div className="graphContainerParent">
          <BuildResultsPieChart build={this.state.currentBuild} />
          <BuildFeaturePieChart build={this.state.currentBuild} />
        </div>
        <br/>
        <div>
          { this.state.currentBuild.suites.map((suite, index) => {
              return <SuiteTable key={index} suite={suite} screenshots={this.state.screenshots} openModal={this.openModal}/>
          })}
        </div>
        <Modal show={this.state.showModal} onHide={this.closeModal} dialogClassName="screenshot-modal">
          <Modal.Header closeButton>
              <Modal.Title>Screenshot Viewer</Modal.Title>
          </Modal.Header>
          <Modal.Body>
              <ScreenshotView buildScreenshots={this.state.screenshots} selectedScreenshotId={this.state.currentShotId} selectedTab={this.state.selectedTab}/>
          </Modal.Body>
         </Modal>
      </div>
    );
  }
}

export default BuildPage;
