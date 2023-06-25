/* eslint  no-param-reassign: [0] */
import React, { useEffect, useContext } from 'react';
import Table from 'react-bootstrap/Table';
import RegionSelect from 'react-region-select';
import BaselineCompareDetailsTable from '../tables/BaselineCompareDetailsTable';
import ScreenshotDetailsTable from '../tables/ScreenshotDetailsTable';
import '../pages/Default.css';
import CurrentScreenshotContext from '../../context/CurrentScreenshotContext';

const BaselineImageView = (props) => {
  const {
    isBaseline,
    getBaselineCompare,
    makeUpdateBaselineRequest,
  } = props;
  const {
    currentScreenshot,
    currentScreenshotDetails,
    currentBaseLineDetails,
    currentBaselineCompare,
    currentBaselineCompareJson,
  } = useContext(CurrentScreenshotContext);
  const [regions, setRegions] = React.useState([]);
  const [editing, setEditing] = React.useState(false);
  const [ignoreBlocks, setIgnoreBlocks] = React.useState([]);
  const regionStyle = { background: 'rgba(0, 255, 80, 0.3)' };

  const resetIgnoreBlocks = () => {
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
    setRegions(existingIgnoreBlocks);
    setEditing(false);
  };

  useEffect(() => {
    if (currentBaseLineDetails && currentBaseLineDetails.ignoreBoxes
      && currentBaseLineDetails.ignoreBoxes.length > 0) {
      resetIgnoreBlocks();
    } else {
      setRegions([]);
      setEditing(false);
    }
  }, [currentBaseLineDetails]);

  useEffect(() => {
    const latestIgnoreBlocks = [];
    regions.forEach((crtRegion) => {
      latestIgnoreBlocks.push({
        left: crtRegion.x,
        top: crtRegion.y,
        right: 100 - (crtRegion.x + crtRegion.width),
        bottom: 100 - (crtRegion.y + crtRegion.height),
      });
    });
    setIgnoreBlocks(latestIgnoreBlocks);
  }, [regions]);

  const onChange = (newRegions) => {
    if (editing) {
      newRegions.forEach((el) => {
        const {
          x,
          y,
          width,
          height,
        } = el;
        el.x = parseInt(x, 10);
        el.y = parseInt(y, 10);
        el.width = parseInt(width, 10);
        el.height = parseInt(height, 10);
      });
      setRegions(newRegions);
    }
  };

  // eslint-disable-next-line no-unused-vars
  const changeRegionData = (index, event) => {
    const region = regions[index];
    let regionsArray = [];
    switch (event.target.value) {
      case 'delete':
        // delete region
        regionsArray = regions.filter((s) => s !== region);
        onChange(regionsArray);
        break;
      default:
        break;
    }
  };

  const deleteRegion = (index) => {
    const region = regions[index];
    let regionsArray = [];
    regionsArray = regions.filter((s) => s !== region);
    onChange(regionsArray);
  };

  const regionRenderer = (regionProps) => {
    if (!regionProps.isChanging) {
      return (
        <div style={{ position: 'absolute', right: 0, bottom: '-25px' }}>
          {
           editing
             ? (
               <span
                 className="remove-region-icon"
                 type="button"
                 onClick={() => deleteRegion(regionProps.index)}
               >
                 <i className="far fa-trash-alt" />
               </span>
             )
             : null
          }
        </div>
      );
    }
    return null;
  };

  const toggleEditing = () => {
    if (editing) {
      makeUpdateBaselineRequest(currentBaseLineDetails._id, undefined, ignoreBlocks);
    }
    setEditing(!editing);
  };

  // init(newRegions) {
  //   setRegions(newRegions);
  // }

  const renderPage = () => {
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
                <div style={{ display: 'block' }}>
                  <div style={{ flexGrow: 1, flexShrink: 1, width: '100%' }}>
                    <RegionSelect
                      maxRegions={10}
                      regions={regions}
                      regionStyle={regionStyle}
                      constraint
                      onChange={onChange}
                      regionRenderer={regionRenderer}
                      style={{ border: '1px solid black' }}
                    >
                      <img className="screenshot" src={currentScreenshot} id="baseline" alt="Compare" width="100%" />
                    </RegionSelect>
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
                    onMouseUp={() => toggleEditing()}
                  >
                    {`${editing ? 'Save' : 'Edit'} Ignore Blocks`}
                  </button>
                  {
                    editing ? (
                      <button
                        type="button"
                        className="btn btn-outline-primary second-button"
                        onMouseUp={() => resetIgnoreBlocks()}
                      >
                        Cancel Changes
                      </button>
                    ) : null
                  }
                </span>
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
          <span>Failed to retrieve baseline compare.</span>
        </div>
      );
    }
    return (
      <Table>
        <tbody>
          <tr>
            <td colSpan="100%" className="sbs-header">
              <span>Baseline Compare </span>
              <span
                type="button"
                onClick={() => getBaselineCompare(currentScreenshotDetails._id, false)}
              >
                <i className="fas fa-redo redo-compare-icon" title="Redo compare against baseline." />
              </span>
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
                    onChange={onChange}
                    regionRenderer={regionRenderer}
                    style={{ border: '1px solid black' }}
                  >
                    <img className="screenshot" src={currentBaselineCompare} id="baseline" alt="Compare" width="100%" />
                  </RegionSelect>
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
                  onMouseUp={() => toggleEditing()}
                >
                  {`${editing ? 'Save' : 'Edit'} Ignore Blocks`}
                </button>
                {
                  editing ? (
                    <button
                      type="button"
                      className="btn btn-outline-primary second-button"
                      onMouseUp={() => resetIgnoreBlocks()}
                    >
                      Cancel Changes
                    </button>
                  ) : null
                }
              </span>
            </td>
          </tr>
        </tbody>
      </Table>
    );
  };

  return renderPage();
};

export default BaselineImageView;
