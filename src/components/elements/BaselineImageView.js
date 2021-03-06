/* eslint  no-param-reassign: [0] */
// TODO: remove this rule and fix.
import React, { Component } from 'react';
import Table from 'react-bootstrap/Table';
import RegionSelect from 'react-region-select';
import BaselineCompareDetailsTable from '../tables/BaselineCompareDetailsTable';
import ScreenshotDetailsTable from '../tables/ScreenshotDetailsTable';

class BaselineImageView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editing: false,
      existingIgnoreBlocks: [],
      regions: [],
      ignoreBlocks: [],
    };
  }

  componentDidMount() {
    const { currentBaseLineDetails } = this.props;
    if (currentBaseLineDetails && currentBaseLineDetails.ignoreBoxes
      && currentBaseLineDetails.ignoreBoxes.length > 0) {
      const existingIgnoreBlocks = [];
      currentBaseLineDetails.ignoreBoxes.forEach((block) => {
        existingIgnoreBlocks.push(
          {
            x: block.left,
            y: block.top,
            width: 100 - (block.left + block.right),
            height: 100 - (block.top + block.bottom),
            data: {},
          },
        );
      });
      console.log(`Current Ignore Blocks: ${existingIgnoreBlocks}`);
      this.state({ regions: existingIgnoreBlocks });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { regions } = this.state;
    if (prevState.regions !== regions) {
      const latestIgnoreBlocks = [];
      regions.forEach((crtRegion) => {
        latestIgnoreBlocks.push({
          left: crtRegion.x,
          top: crtRegion.y,
          right: 100 - (crtRegion.x + crtRegion.width),
          bottom: 100 - (crtRegion.y + crtRegion.height),
        });
      });
      this.setState({ ignoreBlocks: latestIgnoreBlocks });
    }
  }

  onChange = (newRegions) => {
    const { editing } = this.state;
    if (editing) {
      newRegions.forEach((el) => {
        el.x = parseInt(el.x, 10);
        el.y = parseInt(el.y, 10);
        el.width = parseInt(el.width, 10);
        el.height = parseInt(el.height, 10);
      });
      this.setState({ regions: newRegions });
    }
  }

  changeRegionData = (index, event) => {
    const { regions } = this.state;
    const region = regions[index];
    let regionsArray = [];
    switch (event.target.value) {
      case 'delete':
        // delete region
        regionsArray = regions.filter((s) => s !== region);
        this.onChange(regionsArray);
        break;
      default:
        break;
    }
  }

  regionRenderer = (regionProps) => {
    const { editing } = this.state;
    if (!regionProps.isChanging) {
      return (
        <div style={{ position: 'absolute', right: 0, bottom: '-25px' }}>
          {
           editing
             ? (
               <button
                 type="button"
                 onMouseUp={(event) => this.changeRegionData(regionProps.index, event)}
                 value="delete"
               >
                 Delete
               </button>
             )
             : null
          }
        </div>
      );
    }
    return null;
  }

  toggleEditing = () => {
    const { editing } = this.state;
    if (editing) {
      const { currentBaseLineDetails, makeUpdateBaselineRequest } = this.props;
      const { ignoreBlocks } = this.state;
      makeUpdateBaselineRequest(currentBaseLineDetails._id,
        currentBaseLineDetails.screenshot._id, ignoreBlocks);
    }
    this.setState({ editing: !editing });
  }

  init(newRegions) {
    this.setState({ regions: newRegions });
  }

  render() {
    const { regions, ignoreBlocks, editing } = this.state;
    const {
      currentBaseLineDetails,
      currentScreenshotDetails,
      currentBaselineCompare,
      currentBaselineCompareJson,
      currentScreenshot,
      isBaseline,
    } = this.props;

    const regionStyle = {
      background: 'rgba(0, 255, 80, 0.3)',
    };

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
              <div style={{ display: 'block' }}>
                <div style={{ flexGrow: 1, flexShrink: 1, width: '100%' }}>
                  <RegionSelect
                    maxRegions={10}
                    regions={regions}
                    regionStyle={regionStyle}
                    constraint
                    onChange={this.onChange}
                    regionRenderer={this.regionRenderer}
                    style={{ border: '1px solid black' }}
                  >
                    <img className="screenshot" src={currentBaselineCompare} id="baseline" alt="Compare" width="100%" />
                  </RegionSelect>
                  {ignoreBlocks.length > 0
                    ? (
                      <p>
                        Ignored Regions
                        <div>
                          {ignoreBlocks.map((el) => (
                            <p>
                              Left:
                              {el.left}
                              ,Top:
                              {el.top}
                              ,Right:
                              {el.right}
                              ,Bottom:
                              {el.bottom}
                            </p>
                          ))}
                        </div>
                      </p>
                    ) : null}
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td colSpan="100%">
              <span style={{ float: 'left' }}>
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onMouseUp={() => this.toggleEditing()}
                >
                  {`${editing ? 'Save' : 'Edit'} Ignore Blocks`}
                </button>
              </span>
            </td>
          </tr>
        </tbody>
      </Table>
    );
  }
}

export default BaselineImageView;
