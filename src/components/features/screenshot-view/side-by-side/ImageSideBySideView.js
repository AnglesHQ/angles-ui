import React, { useContext } from 'react';
import { Loader } from 'rsuite';
import { FormattedMessage } from 'react-intl';
import ScreenshotDetailsTable from '../ScreenshotDetailsTable';
import CurrentScreenshotContext from '../../../../context/CurrentScreenshotContext';
import Message from '../../../common/Message';

const ImageSideBySideView = function (props) {
  const {
    isBaseline,
  } = props;
  const {
    currentScreenshot,
    currentScreenshotDetails,
    currentBaseline,
    currentBaseLineDetails,
  } = useContext(CurrentScreenshotContext);
  const displaySideBySideBaseline = (baseline) => {
    if (!baseline) {
      return (
        <Message
          type="info"
          message={(
            <span>
              <Loader />
              <FormattedMessage id="common.component.screenshot-view.tabs.side-by-side.message.retrieving-baseline-screenshot" />
            </span>
          )}
        />
      );
    }
    if (baseline === 'ERROR') {
      return (
        <Message
          type="warning"
          message={(
            <span>
              <Loader />
              <FormattedMessage id="common.component.screenshot-view.tabs.side-by-side.message.retrieving-baseline-screenshot-error" />
            </span>
          )}
        />
      );
    }
    return <img className="screenshot" src={baseline} alt="Baseline Screenshot" />;
  };

  const displaySideBySideScreenshot = (screenshot) => {
    if (!screenshot) {
      return (
        <Message
          type="info"
          message={(
            <span>
              <Loader />
              <FormattedMessage id="common.component.screenshot-view.tabs.side-by-side.message.retrieving-screenshot" />
            </span>
          )}
        />
      );
    }
    if (screenshot === 'ERROR') {
      return (
        <Message
          type="warning"
          message={(
            <span>
              <Loader />
              <FormattedMessage id="common.component.screenshot-view.tabs.side-by-side.message.retrieving-screenshot-error" />
            </span>
          )}
        />
      );
    }
    return <img className="screenshot" src={screenshot} alt="Screenshot" />;
  };

  return (
    isBaseline(currentScreenshotDetails._id) ? (
      <table className="baseline-compare-table">
        <tbody>
          <tr>
            <td colSpan="100%" className="baseline-compare-header">
              <FormattedMessage id="common.component.screenshot-view.tabs.side-by-side.label.current-image-baseline" />
            </td>
          </tr>
          <tr>
            <td className="screenshot-details-td">
              <div>
                <ScreenshotDetailsTable
                  currentScreenshotDetails={currentScreenshotDetails}
                  isBaseline={isBaseline(currentScreenshotDetails._id)}
                />
              </div>
            </td>
            <td>
              {
                displaySideBySideScreenshot(currentScreenshot)
              }
            </td>
          </tr>
        </tbody>
      </table>
    ) : (
      <table className="baseline-compare-table">
        <tbody>
          <tr>
            <td colSpan="100%" className="baseline-compare-header">
              <FormattedMessage id="common.component.screenshot-view.tabs.side-by-side.label.current-image" />
            </td>
          </tr>
          <tr>
            <td className="screenshot-details-td">
              <div>
                <ScreenshotDetailsTable
                  currentScreenshotDetails={currentScreenshotDetails}
                  isBaseline={isBaseline(currentScreenshotDetails._id)}
                />
              </div>
            </td>
            <td>
              {
                displaySideBySideScreenshot(currentScreenshot)
              }
            </td>
          </tr>
          {
            currentBaseLineDetails ? ([
              <tr key="title" className="baseline-compare-header">
                <td colSpan="100%">
                  <FormattedMessage id="common.component.screenshot-view.tabs.side-by-side.label.baseline" />
                </td>
              </tr>,
              <tr key="baseline-image">
                <td className="screenshot-details-td">
                  <div>
                    <ScreenshotDetailsTable
                      currentScreenshotDetails={currentBaseLineDetails.screenshot}
                      isBaseline={isBaseline(currentScreenshotDetails._id)}
                    />
                  </div>
                </td>
                <td>
                  {
                    displaySideBySideBaseline(currentBaseline)
                  }
                </td>
              </tr>,
            ]) : null
          }
        </tbody>
      </table>
    )
  );
};

export default ImageSideBySideView;
