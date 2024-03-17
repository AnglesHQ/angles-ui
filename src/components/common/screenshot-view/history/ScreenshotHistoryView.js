import React, { useContext } from 'react';
import { FormattedMessage } from 'react-intl';
import { Container } from 'react-bootstrap';
import CurrentScreenshotContext from '../../../../context/CurrentScreenshotContext';
import Message from '../../Message';
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
    if (currentBaseLineDetails && !doesArrayContainImage(
      screenshotArray,
      currentBaseLineDetails.screenshot,
    )) {
      screenshotArray.push(currentBaseLineDetails.screenshot);
    }
    return screenshotArray;
  };

  return (
    (currentScreenshotHistory == null) ? (
      <Message
        type="info"
        message={(
          <span>
            <i className="fas fa-spinner fa-pulse fa-2x" />
            <FormattedMessage id="common.component.screenshot-view.tabs.history.message.loading-history" />
          </span>
        )}
      />
    ) : (
      <Container className="card-deck-history">
        {getScreenshotArray().map((screenshot) => [
          <ScreenshotCard
            screenshot={screenshot}
            isBaseline={isBaseline(screenshot._id)}
            isSelectedId={isSelectedId(screenshot._id)}
          />,
        ])}
      </Container>
    )
  );
};

export default ScreenshotHistoryView;
