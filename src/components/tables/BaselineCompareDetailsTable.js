import React, { Component } from 'react';
import Moment from 'react-moment';
import Table from 'react-bootstrap/Table';
import { withRouter } from 'react-router-dom';
import '../pages/Default.css';

class BaselineCompareDetailsTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  navigateToTagsPage = (tag, e) => {
    const { history } = this.props;
    e.preventDefault();
    history.push(`/screenshot-finder/?tag=${tag}`);
  }

  navigateToViewsPage = (view, e) => {
    const { history } = this.props;
    e.preventDefault();
    history.push(`/screenshot-finder/?view=${view}`);
  }

  render() {
    const {
      currentScreenshotDetails,
      currentBaseLineDetails,
      currentBaselineCompareJson,
    } = this.props;
    return (
      <Table className="table-screenshot-details" bordered size="sm">
        <thead>
          <tr>
            <th>Parameter</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>View</strong></td>
            <td>
              {currentScreenshotDetails.view ? (
                <span>
                  {`${currentScreenshotDetails.view} `}
                  <a title={`Find all the latest screenshots for view "${currentScreenshotDetails.view}", grouped by platform.`} href="/" onClick={(e) => this.navigateToViewsPage(currentScreenshotDetails.view, e)}>see other platforms</a>
                </span>
              ) : 'No view provided'}
            </td>
          </tr>
          <tr>
            <td><strong>Date</strong></td>
            <td>
              <Moment format="DD-MM-YYYY HH:mm:ss">
                {currentScreenshotDetails.timestamp}
              </Moment>
            </td>
          </tr>
          <tr>
            <td><strong>Baseline Date</strong></td>
            <td>
              <Moment format="DD-MM-YYYY HH:mm:ss">
                {currentBaseLineDetails.screenshot.timestamp}
              </Moment>
            </td>
          </tr>
          {
            currentBaselineCompareJson ? (
              <tr>
                <td><strong>Mismatch</strong></td>
                <td>{`${currentBaselineCompareJson.misMatchPercentage}% (analysis time: ${currentBaselineCompareJson.analysisTime}ms)`}</td>
              </tr>
            ) : null
          }
          <tr>
            <td><strong>Resolution</strong></td>
            <td>{`${currentScreenshotDetails.width} x ${currentScreenshotDetails.height}`}</td>
          </tr>
          <tr>
            <td><strong>Platform Name</strong></td>
            <td>{ currentScreenshotDetails.platform ? currentScreenshotDetails.platform.platformName : 'No platform provided'}</td>
          </tr>
          { currentScreenshotDetails.platform
              && currentScreenshotDetails.platform.platformVersion ? (
                <tr>
                  <td><strong>Platform Version</strong></td>
                  <td>{ currentScreenshotDetails.platform.platformVersion }</td>
                </tr>
            ) : null}
          { currentScreenshotDetails.platform
            && currentScreenshotDetails.platform.deviceName ? (
              <tr>
                <td><strong>Device</strong></td>
                <td>{ currentScreenshotDetails.platform.deviceName }</td>
              </tr>
            ) : null}
          <tr>
            <td><strong>Browser</strong></td>
            <td>{currentScreenshotDetails.platform ? currentScreenshotDetails.platform.browserName : 'No browser provided'}</td>
          </tr>
          <tr>
            <td><strong>Version</strong></td>
            <td>{ currentScreenshotDetails.platform ? currentScreenshotDetails.platform.browserVersion : 'No browser version provided'}</td>
          </tr>
          <tr>
            <td><strong>Tags</strong></td>
            <td>
              {
                currentScreenshotDetails.tags.map((tag) => <a key={tag} title={`Find all the latest screenshots with tag "${tag}", grouped by view.`} href="/" onClick={(e) => this.navigateToTagsPage(tag, e)}>{tag}</a>)
              }
            </td>
          </tr>
        </tbody>
      </Table>
    );
  }
}

export default withRouter(BaselineCompareDetailsTable);
