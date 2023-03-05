import React from 'react';
import Table from 'react-bootstrap/Table';
import ScreenshotDetailsTable from '../tables/ScreenshotDetailsTable';

const CurrentImageView = function (props) {
  const [dynamicBaselineButtonEnabled, setDynamicBaselineButtonEnabled] = React.useState(true);
  const [deleteScreenshotButtonEnabled, setDeleteScreenshotButtonEnabled] = React.useState(true);
  const {
    currentScreenshotDetails,
    currentScreenshot,
    isBaseline,
    updateBaseline,
    generateDynamicBaseline,
    deleteScreenshot,
  } = props;

  const displayScreenshot = (currentScreenshotToDisplay) => {
    if (!currentScreenshotToDisplay) {
      return (
        <div className="alert alert-primary" role="alert">
          <span>
            <i className="fas fa-spinner fa-pulse fa-2x" />
            Retrieving screenshot.
          </span>
        </div>
      );
    }
    if (currentScreenshotToDisplay === 'ERROR') {
      return (
        <div className="alert alert-danger" role="alert">
          <span>
            Unable to retrieve image. Please refresh the page and try again.
          </span>
        </div>
      );
    }
    return <img className="screenshot" src={currentScreenshotToDisplay} alt="Screenshot" />;
  };

  const returnMakeBaselineButton = (screenshotDetailsForButton) => {
    if (screenshotDetailsForButton.platform && screenshotDetailsForButton.view) {
      return (
        <button
          onClick={() => updateBaseline(screenshotDetailsForButton)}
          disabled={isBaseline(screenshotDetailsForButton._id)}
          type="button"
          className="btn btn-outline-primary"
        >
          { !isBaseline(screenshotDetailsForButton._id) ? ('Make Baseline Image') : 'This is the Baseline Image'}
        </button>
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
            <span style={{ float: 'left' }}>
              {
                returnMakeBaselineButton(currentScreenshotDetails)
              }
              <button
                onClick={() => generateDynamicBaselineClick()}
                disabled={!dynamicBaselineButtonEnabled}
                type="button"
                className="btn btn-outline-primary second-button"
              >
                Generate Dynamic Baseline
              </button>
              {
                (
                  currentScreenshotDetails.type && currentScreenshotDetails.type === 'DYNAMIC'
                    && !isBaseline(currentScreenshotDetails._id) ? (
                      <button
                        onClick={() => deleteScreenshotClick()}
                        disabled={!deleteScreenshotButtonEnabled}
                        type="button"
                        className="btn btn-outline-primary second-button"
                        title="Only available for dynamic baselines that are not configured as a baseline."
                      >
                        Delete Screenshot
                      </button>
                    ) : null
                )
              }
            </span>
          </td>
        </tr>
      </tbody>
    </Table>
  );
};

export default CurrentImageView;
