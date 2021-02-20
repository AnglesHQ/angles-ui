import React, { Component } from 'react'
import ExecutionsResultsPieChart from '../charts/ExecutionsResultsPieChart';
import ExecutionsTimeLineChart from '../charts/ExecutionsTimeLineChart';
import HistoryExecutionTable from '../tables/HistoryExecutionTable';
import ScreenshotView from "./ScreenshotView";
import Modal from 'react-bootstrap/Modal';
import '../charts/Charts.css'
import axios from 'axios';
import queryString from 'query-string';

class SummaryPage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      limit: 30,
      currentSkip: 0,
      executions: undefined,
      screenshots: [],
      query: queryString.parse(this.props.location.search),
    };
    this.getExecutionHistoryForExecutionId(this.state.query.executionId, this.state.currentSkip, this.state.limit);
  }

  retrieveScreenshotDetailsForExecutions = (executions) => {
    let screenshotIdArray = [];
    executions.forEach((execution) => {
        execution.actions.forEach((action) => {
          action.steps.forEach((step) => {
            if (step.screenshot) screenshotIdArray.push(step.screenshot);
          })
        })
    });
    this.getScreenshotDetails(screenshotIdArray.join(","));
  }


  getScreenshotDetails = (screenshotIds) => {
    return axios.get(`/screenshot/?screenshotIds=${screenshotIds}&limit=100`)
    .then((res) => {
      this.setState({ screenshots: res.data });
    })
  }
  getExecutionHistoryForExecutionId = (executionId, skip, limit) => {
    return axios.get(`/execution/${executionId}/history?&skip=${skip}&limit=${limit}`)
    .then((res) => {
      let count = res.data.count;
      console.log(`Test case has ${count}`);
      this.retrieveScreenshotDetailsForExecutions(res.data.executions);
      this.setState({ executions: res.data.executions });
    })
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
    if (this.state.executions === undefined) {
      return <div className="alert alert-primary" role="alert">
        <span><i className="fas fa-spinner fa-pulse fa-2x"></i> Retrieving executions.</span>
      </div>
    }
    return (
      <div>
      <h1>History: {this.state.executions[0].title}</h1>
      <div>Suite: {this.state.executions[0].suite}</div>
      <div className="graphContainerParent">
        <ExecutionsResultsPieChart executions={this.state.executions}/>
        <ExecutionsTimeLineChart executions={this.state.executions}/>
      </div>
        <table className="suite-table">
          <thead>
            <tr>
              <th scope="col" colSpan="100%">Suite: {this.state.executions[0].suite} - Test: {this.state.executions[0].title}</th>
            </tr>
          </thead>
          <tbody>
            { this.state.executions.map((execution, index) => {
              return [
                <HistoryExecutionTable key={execution._id} screenshots={this.state.screenshots} openModal={this.openModal} execution={execution} index={index}/>
              ]
            })
          }
          </tbody>
        </table>
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

export default SummaryPage;
