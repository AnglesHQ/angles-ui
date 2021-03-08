import React, { Component } from 'react';
import axios from 'axios';
import queryString from 'query-string';
import { withRouter } from 'react-router-dom';
import Modal from 'react-bootstrap/Modal';
import ExecutionsResultsPieChart from '../charts/ExecutionsResultsPieChart';
import ExecutionsTimeLineChart from '../charts/ExecutionsTimeLineChart';
import HistoryExecutionTable from '../tables/HistoryExecutionTable';
import ScreenshotView from './ScreenshotView';
import '../charts/Charts.css';

class SummaryPage extends Component {
  constructor(props) {
    super(props);
    const { location } = this.props;
    this.state = {
      limit: 30,
      currentSkip: 0,
      executions: undefined,
      screenshots: [],
      query: queryString.parse(location.search),
    };
    const { query, currentSkip, limit } = this.state;
    this.getExecutionHistoryForExecutionId(query.executionId, currentSkip, limit);
  }

  retrieveScreenshotDetailsForExecutions = (executions) => {
    const screenshotIdArray = [];
    executions.forEach((execution) => {
      execution.actions.forEach((action) => {
        action.steps.forEach((step) => {
          if (step.screenshot) screenshotIdArray.push(step.screenshot);
        });
      });
    });
    this.getScreenshotDetails(screenshotIdArray.join(','));
  }

  getScreenshotDetails = (screenshotIds) => axios.get(`/screenshot/?screenshotIds=${screenshotIds}&limit=100`)
    .then((res) => {
      this.setState({ screenshots: res.data });
    })

  getExecutionHistoryForExecutionId = (executionId, skip, limit) => axios.get(`/execution/${executionId}/history?&skip=${skip}&limit=${limit}`)
    .then((res) => {
      const { executions } = res.data;
      this.retrieveScreenshotDetailsForExecutions(executions);
      this.setState({ executions });
    })

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
      executions,
      screenshots,
      showModal,
      currentShotId,
      selectedTab,
    } = this.state;
    if (executions === undefined) {
      return (
        <div className="alert alert-primary" role="alert">
          <span>
            <i className="fas fa-spinner fa-pulse fa-2x" />
            <span> Retrieving executions.</span>
          </span>
        </div>
      );
    }
    return (
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
        <table className="suite-table">
          <thead>
            <tr>
              <th scope="col" colSpan="100%">
                <span>{`Suite: ${executions[0].suite} - Test: ${executions[0].title}`}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            { executions.map((execution, index) => [
              <HistoryExecutionTable
                key={execution._id}
                screenshots={screenshots}
                openModal={this.openModal}
                execution={execution}
                index={index}
              />,
            ])}
          </tbody>
        </table>
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

export default withRouter(SummaryPage);
