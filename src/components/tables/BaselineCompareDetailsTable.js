import React from 'react';
import Moment from 'react-moment';
import Table from 'react-bootstrap/Table';
import { useNavigate } from 'react-router-dom';
import '../pages/Default.css';

const BaselineCompareDetailsTable = function (props) {
  const {
    currentScreenshotDetails,
    currentBaseLineDetails,
    currentBaselineCompareJson,
  } = props;

  const navigateToTagsPage = (tag, e) => {
    const navigate = useNavigate();
    e.preventDefault();
    navigate(`/screenshot-finder/?tag=${tag}`);
  };

  const navigateToViewsPage = (view, e) => {
    const navigate = useNavigate();
    e.preventDefault();
    navigate(`/screenshot-finder/?view=${view}`);
  };

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
                <a title={`Find all the latest screenshots for view "${currentScreenshotDetails.view}", grouped by platform.`} href="/" onClick={(e) => navigateToViewsPage(currentScreenshotDetails.view, e)}>see other platforms</a>
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
              currentScreenshotDetails.tags.map((tag) => <a key={tag} title={`Find all the latest screenshots with tag "${tag}", grouped by view.`} href="/" onClick={(e) => navigateToTagsPage(tag, e)}>{tag}</a>)
            }
          </td>
        </tr>
      </tbody>
    </Table>
  );
};

export default BaselineCompareDetailsTable;
