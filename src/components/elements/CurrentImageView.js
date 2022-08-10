import React, { Component } from 'react';
import Table from 'react-bootstrap/Table';
import ScreenshotDetailsTable from '../tables/ScreenshotDetailsTable';

class CurrentImageView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      //
    };
  }

  displayScreenshot = (currentScreenshot) => {
    if (!currentScreenshot) {
      return (
        <div className="alert alert-primary" role="alert">
          <span>
            <i className="fas fa-spinner fa-pulse fa-2x" />
            Retrieving screenshot.
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
  };

  returnMakeBaselineButton = (currentScreenshotDetails) => {
    const { isBaseline, updateBaseline } = this.props;
    if (currentScreenshotDetails.platform && currentScreenshotDetails.view) {
      return (
        <button
          onClick={() => updateBaseline(currentScreenshotDetails)}
          disabled={isBaseline(currentScreenshotDetails._id)}
          type="button"
          className="btn btn-outline-primary"
        >
          { !isBaseline(currentScreenshotDetails._id) ? ('Make Baseline Image') : 'This is the Baseline Image'}
        </button>
      );
    }
    return null;
  };

  // generateAndOpenBaselineImage = (currenScreenshotDetails) => {
  //   const { generateDynamicBaseline } = this.props;
  //   generateDynamicBaseline(currenScreenshotDetails)
  //     .then((dynamicBaselineImage) => {
  //       this.navigateToImage(dynamicBaselineImage);
  //     });
  // };

  render() {
    const {
      currentScreenshotDetails,
      currentScreenshot,
      isBaseline,
      generateDynamicBaseline,
    } = this.props;

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
                this.displayScreenshot(currentScreenshot)
              }
            </td>
          </tr>
          <tr>
            <td colSpan="100%">
              <span style={{ float: 'left' }}>
                {
                  this.returnMakeBaselineButton(currentScreenshotDetails)
                }
              </span>
              <button
                onClick={() => generateDynamicBaseline(currentScreenshotDetails)}
                type="button"
                className="btn btn-outline-primary"
              >
                Generate Dynamic Baseline
              </button>
            </td>
          </tr>
        </tbody>
      </Table>
    );
  }
}

export default CurrentImageView;
