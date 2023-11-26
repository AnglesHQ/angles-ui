/* eslint  no-param-reassign: [0] */
import React, { useEffect, useContext } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  Button,
  Stack,
} from 'rsuite';
import { IoGitCompareOutline } from 'react-icons/io5';
import { RiDeleteBin6Line } from 'react-icons/ri';
import Table from 'react-bootstrap/Table';
import RegionSelect from 'react-region-select';
import ScreenshotDetailsTable from '../ScreenshotDetailsTable';
import CurrentScreenshotContext from '../../../../context/CurrentScreenshotContext';
import Message from '../../Message';

const BaselineImageView = (props) => {
  const intl = useIntl();
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
                 <RiDeleteBin6Line className="baseline-action-icon" />
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

  const generateBaselineCompareTable = () => {
    const isBaselineImage = isBaseline(currentScreenshotDetails._id);
    const imageToDisplay = isBaselineImage ? currentScreenshot : currentBaselineCompare;
    return (
      <Table className="baseline-compare-table">
        <tbody>
          <tr>
            {
              isBaselineImage ? (
                <td colSpan="100%" className="baseline-compare-header">
                  <FormattedMessage id="common.component.screenshot-view.tabs.baseline.label.current-image-baseline" />
                </td>
              ) : (
                <td colSpan="100%" className="baseline-compare-header">
                  <span>
                    <FormattedMessage id="common.component.screenshot-view.tabs.baseline.label.baseline-compare" />
                  </span>
                  <span>  </span>
                  <span
                    className="baseline-action-icon"
                    type="button"
                    onClick={() => getBaselineCompare(currentScreenshotDetails._id, false)}
                  >
                    <IoGitCompareOutline title={intl.formatMessage({ id: 'common.component.screenshot-view.tabs.baseline.button.redo-compare-description' })} />
                  </span>
                </td>
              )
            }
          </tr>
          <tr>
            <td className="screenshot-details-td">
              <div>
                <ScreenshotDetailsTable
                  currentScreenshotDetails={currentScreenshotDetails}
                  isBaseline={isBaselineImage}
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
                  >
                    <img className="screenshot" src={imageToDisplay} id="baseline" alt="Compare" width="100%" />
                  </RegionSelect>
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td colSpan="100%">
              <Stack spacing={10}>
                <Button
                  type="button"
                  className="filter-submit-button"
                  onMouseUp={() => toggleEditing()}
                >
                  {
                    editing ? (
                      <FormattedMessage id="common.component.screenshot-view.tabs.baseline.button.save-ignore-blocks" />
                    ) : (
                      <FormattedMessage id="common.component.screenshot-view.tabs.baseline.button.edit-ignore-blocks" />
                    )
                  }
                </Button>
                {
                  editing ? (
                    <Button
                      type="button"
                      className="filter-submit-button"
                      onMouseUp={() => resetIgnoreBlocks()}
                    >
                      <FormattedMessage id="common.component.screenshot-view.tabs.baseline.button.cancel-changes" />
                    </Button>
                  ) : null
                }
              </Stack>
            </td>
          </tr>
        </tbody>
      </Table>
    );
  };

  const renderPage = () => {
    if (!currentBaseLineDetails) {
      return <FormattedMessage id="common.component.screenshot-view.tabs.baseline.message.no-baseline-set" />;
    }
    if (currentBaseLineDetails.screenshot._id === currentScreenshotDetails._id) {
      return generateBaselineCompareTable();
    }
    if (!currentBaselineCompare) {
      return (
        <Message
          type="warning"
          message={(
            <span>
              <i className="fas fa-spinner fa-pulse fa-2x" />
              <FormattedMessage id="common.component.screenshot-view.tabs.baseline.message.loading-baseline-compare" />
            </span>
          )}
        />
      );
    }
    if (currentBaselineCompare === 'ERROR') {
      return (
        <Message
          type="warning"
          message={(
            <span>
              <FormattedMessage id="ccommon.component.screenshot-view.tabs.baseline.message.loading-baseline-error" />
            </span>
          )}
        />
      );
    }
    return generateBaselineCompareTable();
  };

  return renderPage();
};

export default BaselineImageView;
