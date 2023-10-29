import React from 'react';
import { Panel } from 'rsuite';
import Moment from 'react-moment';

const ScreenshotDetailsTable = function (props) {
  const {
    currentScreenshotDetails,
    isBaseline,
    currentBaseLineDetails,
    currentBaselineCompareJson,
  } = props;

  return (
    <Panel
      className="screenshot-details-panel"
    >
      <div className="screenshot-details-panel-body">
        <div className="screenshot-details-row">
          <span className="screenshot-details-label">View: </span>
          {currentScreenshotDetails.view ? (
            <span>
              {`${currentScreenshotDetails.view} `}
              <a title={`Find all the latest screenshots for view "${currentScreenshotDetails.view}", grouped by platform.`} href={`/screenshot-library/?view=${currentScreenshotDetails.view}`}>see other platforms</a>
            </span>
          ) : 'No view provided'}
        </div>
        <div className="screenshot-details-row">
          <span className="screenshot-details-label">Date: </span>
          <span>
            <Moment format="DD-MM-YYYY HH:mm:ss">
              {currentScreenshotDetails.timestamp}
            </Moment>
          </span>
        </div>
        {
          currentBaseLineDetails ? (
            <div className="screenshot-details-row">
              <span className="screenshot-details-label">Baseline Date: </span>
              <span>
                <Moment format="DD-MM-YYYY HH:mm:ss">
                  {currentBaseLineDetails.screenshot.timestamp}
                </Moment>
              </span>
            </div>
          ) : null
        }
        {
          currentBaselineCompareJson ? (
            <div className="screenshot-details-row">
              <span className="screenshot-details-label">Mismatch: </span>
              <span>{`${currentBaselineCompareJson.misMatchPercentage}% (analysis time: ${currentBaselineCompareJson.analysisTime}ms)`}</span>
            </div>
          ) : null
        }
        <div className="screenshot-details-row">
          <span className="screenshot-details-label">Resolution: </span>
          <span>{`${currentScreenshotDetails.width} x ${currentScreenshotDetails.height}`}</span>
        </div>
        <div className="screenshot-details-row">
          <span className="screenshot-details-label">Platform: </span>
          <span>{currentScreenshotDetails.platform ? currentScreenshotDetails.platform.platformName : 'No platform provided'}</span>
        </div>
        { currentScreenshotDetails.platform
        && currentScreenshotDetails.platform.platformVersion ? (
          <div className="screenshot-details-row">
            <span className="screenshot-details-label">Platform Version: </span>
            <span>{ currentScreenshotDetails.platform.platformVersion }</span>
          </div>
          ) : null}
        { currentScreenshotDetails.platform
        && currentScreenshotDetails.platform.deviceName ? (
          <div className="screenshot-details-row">
            <span className="screenshot-details-label">Device(s): </span>
            <span>{ currentScreenshotDetails.platform.deviceName }</span>
          </div>
          ) : null}
        <div className="screenshot-details-row">
          <span className="screenshot-details-label">Browser: </span>
          <span>{currentScreenshotDetails.platform ? currentScreenshotDetails.platform.browserName : 'No browser provided'}</span>
        </div>
        <div className="screenshot-details-row">
          <span className="screenshot-details-label">Browser Version: </span>
          <span>{ currentScreenshotDetails.platform ? currentScreenshotDetails.platform.browserVersion : 'No browser version provided'}</span>
        </div>
        <div className="screenshot-details-row">
          <span className="screenshot-details-label">Baseline: </span>
          <span>{isBaseline ? 'Yes' : 'No'}</span>
        </div>
        <div className="screenshot-details-row">
          <span className="screenshot-details-label">Tags: </span>
          <span>
            {
              currentScreenshotDetails.tags.map((tag, index) => (
                <span key={`span-${tag}`}>
                  { index > 0 && ', '}
                  <a key={tag} title={`Find all the latest screenshots with tag "${tag}", grouped by view.`} href={`/screenshot-library/?tag=${tag}`}>{tag}</a>
                </span>
              ))
            }
          </span>
        </div>
      </div>
    </Panel>
  );
};

export default ScreenshotDetailsTable;
