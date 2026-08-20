import React, { useContext } from 'react';
import { Loader } from 'rsuite';
import { FormattedMessage } from 'react-intl';
import CurrentScreenshotContext from '../../../../context/CurrentScreenshotContext';
import Message from '../../../common/Message';
import ScreenshotCard from '../ScreenshotCard';

const ScreenshotHistoryView = function (props) {
  const {
    isBaseline,
  } = props;
  const {
    currentScreenshotDetails,
    currentScreenshotHistory,
    currentBaseLineDetails,
  } = useContext(CurrentScreenshotContext);

  const isSelectedId = (screenshotId) => {
    if (currentScreenshotDetails && currentScreenshotDetails._id === screenshotId) {
      return true;
    }
    return false;
  };

  const doesArrayContainImage = (screenshotArray, screenshotToLookFor) => {
    const filterScreenshot = screenshotArray
      .filter((screenshot) => screenshot._id === screenshotToLookFor._id);
    if (filterScreenshot.length > 0) {
      return true;
    }
    return false;
  };

  const getScreenshotArray = () => {
    // ensure that the baseline is added if not in the history.
    const screenshotArray = currentScreenshotHistory.map((screenshot) => ({ ...screenshot }));
    const baselineScreenshot = currentBaseLineDetails ? currentBaseLineDetails.screenshot : null;
    // the baseline screenshot may come back unpopulated (just an id), in which case
    // there is nothing to render a card from.
    const isPopulated = baselineScreenshot !== null && typeof baselineScreenshot === 'object';
    if (isPopulated && !doesArrayContainImage(screenshotArray, baselineScreenshot)) {
      screenshotArray.push(baselineScreenshot);
    }
    return screenshotArray;
  };

  return (
    (currentScreenshotHistory == null) ? (
      <Message
        type="info"
        message={(
          <span>
            <Loader />
            <FormattedMessage id="common.component.screenshot-view.tabs.history.message.loading-history" />
          </span>
        )}
      />
    ) : (
      <div className="card-deck-history">
        {getScreenshotArray().map((screenshot) => [
          <ScreenshotCard
            screenshot={screenshot}
            isBaseline={isBaseline(screenshot._id)}
            isSelectedId={isSelectedId(screenshot._id)}
          />,
        ])}
      </div>
    )
  );
};

export default ScreenshotHistoryView;
