import React from 'react';
import { Panel } from 'rsuite';
import Moment from 'react-moment';
import { FormattedMessage, useIntl } from 'react-intl';

const ScreenshotDetailsTable = function (props) {
  const intl = useIntl();
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
          <span className="screenshot-details-label">
            <FormattedMessage id="common.component.screenshot-details-table.label.view" />
          </span>
          <span>: </span>
          {currentScreenshotDetails.view ? (
            <span>
              {`${currentScreenshotDetails.view} `}
              <a title={intl.formatMessage({ id: 'common.component.screenshot-details-table.label.view-link-description' }, { view: currentScreenshotDetails.view })} href={`/screenshot-library/?view=${currentScreenshotDetails.view}`}>
                <FormattedMessage id="common.component.screenshot-details-table.label.view-link" />
              </a>
            </span>
          ) : <FormattedMessage id="common.component.screenshot-details-table.label.no-view" />}
        </div>
        <div className="screenshot-details-row">
          <span className="screenshot-details-label">
            <FormattedMessage id="common.component.screenshot-details-table.label.date" />
          </span>
          <span>: </span>
          <span>
            <Moment format="DD-MM-YYYY HH:mm:ss">
              {currentScreenshotDetails.timestamp}
            </Moment>
          </span>
        </div>
        {
          currentBaseLineDetails ? (
            <div className="screenshot-details-row">
              <span className="screenshot-details-label">
                <FormattedMessage id="common.component.screenshot-details-table.label.baseline-date" />
              </span>
              <span>: </span>
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
              <span className="screenshot-details-label">
                <FormattedMessage id="common.component.screenshot-details-table.label.mismatch" />
              </span>
              <span>: </span>
              <span>
                <FormattedMessage id="common.component.screenshot-details-table.label.mismatch-result" values={{ mismatchPercentage: currentBaselineCompareJson.misMatchPercentage, time: currentBaselineCompareJson.analysisTime }} />
              </span>
            </div>
          ) : null
        }
        <div className="screenshot-details-row">
          <span className="screenshot-details-label">
            <FormattedMessage id="common.component.screenshot-details-table.label.resolution" />
          </span>
          <span>: </span>
          <span>{`${currentScreenshotDetails.width} x ${currentScreenshotDetails.height}`}</span>
        </div>
        <div className="screenshot-details-row">
          <span className="screenshot-details-label">
            <FormattedMessage id="common.component.screenshot-details-table.label.platform" />
          </span>
          <span>: </span>
          <span>{currentScreenshotDetails.platform ? currentScreenshotDetails.platform.platformName : <FormattedMessage id="common.component.screenshot-details-table.label.no-platform" />}</span>
        </div>
        { currentScreenshotDetails.platform
        && currentScreenshotDetails.platform.platformVersion ? (
          <div className="screenshot-details-row">
            <span className="screenshot-details-label">
              <FormattedMessage id="common.component.screenshot-details-table.label.platform-version" />
            </span>
            <span>: </span>
            <span>{ currentScreenshotDetails.platform.platformVersion }</span>
          </div>
          ) : null}
        { currentScreenshotDetails.platform
        && currentScreenshotDetails.platform.deviceName ? (
          <div className="screenshot-details-row">
            <span className="screenshot-details-label">
              <FormattedMessage id="common.component.screenshot-details-table.label.device" />
            </span>
            <span>: </span>
            <span>{ currentScreenshotDetails.platform.deviceName }</span>
          </div>
          ) : null}
        <div className="screenshot-details-row">
          <span className="screenshot-details-label">
            <FormattedMessage id="common.component.screenshot-details-table.label.browser" />
          </span>
          <span>: </span>
          <span>{currentScreenshotDetails.platform ? currentScreenshotDetails.platform.browserName : <FormattedMessage id="common.component.screenshot-details-table.label.no-browser" />}</span>
        </div>
        <div className="screenshot-details-row">
          <span className="screenshot-details-label">
            <FormattedMessage id="common.component.screenshot-details-table.label.browser-version" />
          </span>
          <span>: </span>
          <span>{ currentScreenshotDetails.platform ? currentScreenshotDetails.platform.browserVersion : <FormattedMessage id="common.component.screenshot-details-table.label.no-browser" />}</span>
        </div>
        <div className="screenshot-details-row">
          <span className="screenshot-details-label">
            <FormattedMessage id="common.component.screenshot-details-table.label.baseline" />
          </span>
          <span>: </span>
          <span>{isBaseline ? <FormattedMessage id="common.yes" /> : <FormattedMessage id="common.no" />}</span>
        </div>
        <div className="screenshot-details-row">
          <span className="screenshot-details-label">
            <FormattedMessage id="common.component.screenshot-details-table.label.tags" />
          </span>
          <span>: </span>
          <span>
            {
              currentScreenshotDetails.tags.map((tag, index) => (
                <span key={`span-${tag}`}>
                  { index > 0 && ', '}
                  <a key={tag} title={intl.formatMessage({ id: 'common.component.screenshot-details-table.label.tags-description' }, { tag })} href={`/screenshot-library/?tag=${tag}`}>{tag}</a>
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
