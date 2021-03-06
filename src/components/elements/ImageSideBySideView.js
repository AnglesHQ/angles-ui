import React, { Component } from 'react';
import Table from 'react-bootstrap/Table';
import ScreenshotDetailsTable from '../tables/ScreenshotDetailsTable';

class ImageSideBySideView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      //
    };
  }

  displaySideBySideBaseline = (currentBaseline) => {
    if (!currentBaseline) {
      return (
        <div className="alert alert-primary" role="alert">
          <span>
            <i className="fas fa-spinner fa-pulse fa-2x" />
            <span> Retrieving baseline screenshot.</span>
          </span>
        </div>
      );
    }
    if (currentBaseline === 'ERROR') {
      return (
        <div className="alert alert-danger" role="alert">
          <span>
            Unable to retrieve baseline image.
            Please refresh the page and try again.
          </span>
        </div>
      );
    }
    return <img className="screenshot" src={currentBaseline} alt="Baseline Screenshot" />;
  }

  displaySideBySideScreenshot = (currentScreenshot) => {
    if (!currentScreenshot) {
      return (
        <div className="alert alert-primary" role="alert">
          <span>
            <i className="fas fa-spinner fa-pulse fa-2x" />
            <span> Retrieving screenshot.</span>
          </span>
        </div>
      );
    }
    if (currentScreenshot === 'ERROR') {
      return (
        <div className="alert alert-danger" role="alert">
          <span>
            Unable to retrieve image. Please refresh the page and try again.
          </span>
        </div>
      );
    }
    return <img className="screenshot" src={currentScreenshot} alt="Screenshot" />;
  }

  render() {
    const {
      currentBaseLineDetails,
      currentScreenshotDetails,
      currentScreenshot,
      currentBaseline,
      isBaseline,
    } = this.props;

    if (isBaseline(currentScreenshotDetails._id)) {
      return (
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
                  this.displaySideBySideScreenshot(currentScreenshot)
                }
              </td>
            </tr>
          </tbody>
        </Table>
      );
    }

    return (
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
                this.displaySideBySideScreenshot(currentScreenshot)
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
                    this.displaySideBySideBaseline(currentBaseline)
                  }
                </td>
              </tr>,
            ]) : null
          }
        </tbody>
      </Table>
    );
  }
}

export default ImageSideBySideView;
