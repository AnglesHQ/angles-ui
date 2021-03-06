import React, { Component } from 'react';
import Table from 'react-bootstrap/Table';
import BaselineCompareDetailsTable from '../tables/BaselineCompareDetailsTable';
import ScreenshotDetailsTable from '../tables/ScreenshotDetailsTable';

class BaselineImageView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      //
    };
  }

  render() {
    const {
      currentBaseLineDetails,
      currentScreenshotDetails,
      currentBaselineCompare,
      currentBaselineCompareJson,
      currentScreenshot,
      isBaseline,
    } = this.props;

    if (!currentBaseLineDetails) {
      return 'No Baseline selected yet for this view and deviceName or browser combination. To select a baseline, navigate to the image you want as a baseline and click on the "Make Baseline Image" button';
    }
    if (currentBaseLineDetails.screenshot._id === currentScreenshotDetails._id) {
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
                <img className="screenshot" src={currentScreenshot} alt="Compare" />
              </td>
            </tr>
          </tbody>
        </Table>
      );
    }
    if (!currentBaselineCompare) {
      return (
        <div className="alert alert-primary" role="alert">
          <span>
            <i className="fas fa-spinner fa-pulse fa-2x" />
            Loading baseline compare.
          </span>
        </div>
      );
    }
    if (currentBaselineCompare === 'ERROR') {
      return (
        <div className="alert alert-danger" role="alert">
          <span>Failed to retrieve basedline compare.</span>
        </div>
      );
    }
    return (
      <Table>
        <tbody>
          <tr>
            <td colSpan="100%" className="sbs-header">
              Baseline Compare
            </td>
          </tr>
          <tr>
            <td className="screenshot-details-td">
              <div>
                <BaselineCompareDetailsTable
                  currentScreenshotDetails={currentScreenshotDetails}
                  currentBaseLineDetails={currentBaseLineDetails}
                  currentBaselineCompareJson={currentBaselineCompareJson}
                />
              </div>
            </td>
            <td>
              <img className="screenshot" src={currentBaselineCompare} alt="Compare" />
            </td>
          </tr>
        </tbody>
      </Table>
    );
  }
}

export default BaselineImageView;
