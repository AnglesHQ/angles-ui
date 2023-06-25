import React, { useContext } from 'react';
import Table from 'react-bootstrap/Table';
import ScreenshotDetailsTable from '../tables/ScreenshotDetailsTable';
import CurrentScreenshotContext from '../../context/CurrentScreenshotContext';

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
        <div className="alert alert-primary" role="alert">
          <span>
            <i className="fas fa-spinner fa-pulse fa-2x" />
            <span> Retrieving baseline screenshot.</span>
          </span>
        </div>
      );
    }
    if (baseline === 'ERROR') {
      return (
        <div className="alert alert-danger" role="alert">
          <span>
            Unable to retrieve baseline image.
            Please refresh the page and try again.
          </span>
        </div>
      );
    }
    return <img className="screenshot" src={baseline} alt="Baseline Screenshot" />;
  };

  const displaySideBySideScreenshot = (screenshot) => {
    if (!screenshot) {
      return (
        <div className="alert alert-primary" role="alert">
          <span>
            <i className="fas fa-spinner fa-pulse fa-2x" />
            <span> Retrieving screenshot.</span>
          </span>
        </div>
      );
    }
    if (screenshot === 'ERROR') {
      return (
        <div className="alert alert-danger" role="alert">
          <span>
            Unable to retrieve image. Please refresh the page and try again.
          </span>
        </div>
      );
    }
    return <img className="screenshot" src={screenshot} alt="Screenshot" />;
  };

  return (
    isBaseline(currentScreenshotDetails._id) ? (
      <Table>
        <tbody>
          <tr>
            <td colSpan="100%" className="sbs-header">
              Current Image (and Baseline)
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
      </Table>
    ) : (
      <Table>
        <tbody>
          <tr>
            <td colSpan="100%" className="sbs-header">
              Current Image
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
              <tr key="title" className="sbs-header">
                <td colSpan="100%">
                  Baseline
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
      </Table>
    )
  );
};

export default ImageSideBySideView;
