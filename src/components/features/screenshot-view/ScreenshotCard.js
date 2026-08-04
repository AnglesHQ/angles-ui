import { FormattedMessage, useIntl } from 'react-intl';
import Moment from 'react-moment';
import React from 'react';
import { VscVerified } from 'react-icons/vsc';

const grabThumbnail = (screenshot) => {
  if (screenshot.thumbnail.startsWith('data:image')) {
    return screenshot.thumbnail;
  }
  return `data:image/png;base64, ${screenshot.thumbnail}`;
};
const ScreenshotCard = function (props) {
  const {
    screenshot,
    isBaseline,
    isSelectedId,
  } = props;
  const intl = useIntl();

  return (
    <div key={screenshot._id} className={`screenshot-card ${isSelectedId ? 'card-active' : ''}`}>
      {
        isBaseline ? (
          <div
            className="baseline-overlay"
            title={intl.formatMessage({ id: 'common.component.screenshot-view.tabs.history.label.baseline' })}
          >
            <VscVerified />
          </div>
        ) : null
      }
      { !isSelectedId ? (
        <a title="Go to screenshot" href={`/test-run?buildId=${screenshot.build}&loadScreenshotId=${screenshot._id}`}>
          <img className="card-image-history" src={`${grabThumbnail(screenshot)}`} alt={screenshot.view || 'screenshot'} />
        </a>
      ) : <img className="card-image-history" src={`${grabThumbnail(screenshot)}`} alt={screenshot.view || 'screenshot'} /> }
      <div className="screenshot-card-footer">
        <table className="table-screenshot-history-details screenshot-table">
          <tbody>
            <tr>
              <td>
                <span className="card-label">
                  <FormattedMessage id="common.component.screenshot-view.tabs.history.label.view" />
                </span>
                <span>: </span>
                <span>{` ${screenshot.view}`}</span>
              </td>
            </tr>
            <tr>
              <td>
                <span className="card-label">
                  <FormattedMessage id="common.component.screenshot-view.tabs.history.label.date" />
                </span>
                <span>: </span>
                <Moment utc format="DD-MM-YYYY HH:mm:ss">
                  {screenshot.timestamp}
                </Moment>
              </td>
            </tr>
            <tr>
              <td>
                <span className="card-label">
                  <FormattedMessage id="common.component.screenshot-view.tabs.history.label.resolution" />
                </span>
                <span>: </span>
                <span>{`${screenshot.width} x ${screenshot.height}`}</span>
              </td>
            </tr>
            <tr>
              <td>
                <span className="card-label">
                  <FormattedMessage id="common.component.screenshot-view.tabs.history.label.platform" />
                </span>
                <span>: </span>
                { screenshot.platform ? (screenshot.platform.platformName) : '' }
                { screenshot.platform && screenshot.platform.platformVersion ? (screenshot.platform.platformVersion) : '' }
                { screenshot.platform && screenshot.platform.browserName ? (` (${screenshot.platform.browserName}${screenshot.platform.browserVersion ? (` ${screenshot.platform.browserVersion}`) : ''})`) : '' }
              </td>
            </tr>
            {
              screenshot.platform && screenshot.platform.deviceName ? (
                <tr>
                  <td>
                    <span className="card-label">
                      <FormattedMessage id="common.component.screenshot-view.tabs.history.label.device" />
                    </span>
                    <span>: </span>
                    {` ${screenshot.platform.deviceName} `}
                  </td>
                </tr>
              ) : null
            }
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ScreenshotCard;
