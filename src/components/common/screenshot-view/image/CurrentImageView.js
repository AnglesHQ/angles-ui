import React, { useContext } from 'react';
import { Button, Stack } from 'rsuite';
import { FormattedMessage, useIntl } from 'react-intl';
import Table from 'react-bootstrap/Table';
import ScreenshotDetailsTable from '../ScreenshotDetailsTable';
import CurrentScreenshotContext from '../../../../context/CurrentScreenshotContext';
import Message from '../../Message';

const CurrentImageView = function (props) {
  const intl = useIntl();
  const [dynamicBaselineButtonEnabled, setDynamicBaselineButtonEnabled] = React.useState(true);
  const [deleteScreenshotButtonEnabled, setDeleteScreenshotButtonEnabled] = React.useState(true);
  const {
    isBaseline,
    updateBaseline,
    generateDynamicBaseline,
    deleteScreenshot,
  } = props;
  const {
    currentScreenshot,
    currentScreenshotDetails,
  } = useContext(CurrentScreenshotContext);

  const displayScreenshot = (currentScreenshotToDisplay) => {
    if (!currentScreenshotToDisplay) {
      return (
        <Message
          type="info"
          message={(
            <span>
              <i className="fas fa-spinner fa-pulse fa-2x" />
              <FormattedMessage id="common.component.screenshot-view.tabs.screenshot.message.retrieving-screenshot" />
            </span>
          )}
        />
      );
    }
    if (currentScreenshotToDisplay === 'ERROR') {
      return (
        <Message
          type="warning"
          message={(
            <span>
              <FormattedMessage id="common.component.screenshot-view.tabs.screenshot.message.retrieving-screenshot-error" />
            </span>
          )}
        />
      );
    }
    return <img className="screenshot" src={currentScreenshotToDisplay} alt="Screenshot" />;
  };

  const returnMakeBaselineButton = (screenshotDetailsForButton) => {
    if (screenshotDetailsForButton.platform && screenshotDetailsForButton.view) {
      return (
        <Button
          onClick={() => updateBaseline(screenshotDetailsForButton)}
          disabled={isBaseline(screenshotDetailsForButton._id)}
          type="button"
          className="filter-submit-button"
        >
          { !isBaseline(screenshotDetailsForButton._id) ? (
            <FormattedMessage id="common.component.screenshot-view.tabs.screenshot.button.make-baseline-image" />
          ) : <FormattedMessage id="common.component.screenshot-view.tabs.screenshot.button.is-baseline-image" />}
        </Button>
      );
    }
    return null;
  };

  const deleteScreenshotClick = async () => {
    await setDeleteScreenshotButtonEnabled(false);
    await deleteScreenshot(currentScreenshotDetails);
    await setDeleteScreenshotButtonEnabled(true);
  };

  const generateDynamicBaselineClick = async () => {
    await setDynamicBaselineButtonEnabled(false);
    await generateDynamicBaseline(currentScreenshotDetails);
    await setDynamicBaselineButtonEnabled(true);
  };

  return (
    <Table>
      <tbody>
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
              displayScreenshot(currentScreenshot)
            }
          </td>
        </tr>
        <tr>
          <td colSpan="100%">
            <Stack spacing={10}>
              {
                returnMakeBaselineButton(currentScreenshotDetails)
              }
              <Button
                onClick={() => generateDynamicBaselineClick()}
                disabled={!dynamicBaselineButtonEnabled}
                type="button"
                className="filter-submit-button"
              >
                <FormattedMessage id="common.component.screenshot-view.tabs.screenshot.button.generate-dynamic-baseline" />
              </Button>
              {
                (
                  currentScreenshotDetails.type && currentScreenshotDetails.type === 'DYNAMIC'
                    && !isBaseline(currentScreenshotDetails._id) ? (
                      <Button
                        onClick={() => deleteScreenshotClick()}
                        disabled={!deleteScreenshotButtonEnabled}
                        type="button"
                        className="filter-submit-button"
                        title={intl.formatMessage({ id: 'common.component.screenshot-view.tabs.screenshot.button.delete-screenshot-description' })}
                      >
                        <FormattedMessage id="common.component.screenshot-view.tabs.screenshot.button.delete-screenshot" />
                      </Button>
                    ) : null
                )
              }
            </Stack>
          </td>
        </tr>
      </tbody>
    </Table>
  );
};

export default CurrentImageView;
