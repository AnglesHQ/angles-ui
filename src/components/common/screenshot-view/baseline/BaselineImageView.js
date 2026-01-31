/* eslint  no-param-reassign: [0] */
import React, { useEffect, useContext, useState, useRef } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  Button,
  Stack,
} from 'rsuite';
import { IoGitCompareOutline } from 'react-icons/io5';
import { RiDeleteBin6Line } from 'react-icons/ri';
import Table from 'react-bootstrap/Table';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
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

  const [regions, setRegions] = useState([]);
  const [editing, setEditing] = useState(false);
  const [crop, setCrop] = useState();
  const [activeIndex, setActiveIndex] = useState(null);
  const imgRef = useRef(null);

  // Load initial regions from baseline details
  useEffect(() => {
    if (currentBaseLineDetails && currentBaseLineDetails.ignoreBoxes
      && currentBaseLineDetails.ignoreBoxes.length > 0) {
      const existingIgnoreBlocks = currentBaseLineDetails.ignoreBoxes.map((block) => ({
        unit: '%',
        x: block.left,
        y: block.top,
        width: 100 - (block.left + block.right),
        height: 100 - (block.top + block.bottom),
      }));
      setRegions(existingIgnoreBlocks);
    } else {
      setRegions([]);
      setEditing(false);
    }
  }, [currentBaseLineDetails]);

  const toggleEditing = () => {
    if (editing) {
      // Save: Convert regions back to left/top/right/bottom format
      const ignoreBlocks = regions.map((r) => ({
        left: r.x,
        top: r.y,
        right: 100 - (r.x + r.width),
        bottom: 100 - (r.y + r.height),
      }));
      makeUpdateBaselineRequest(currentBaseLineDetails._id, undefined, ignoreBlocks);
    }
    setEditing(!editing);
    setActiveIndex(null);
    setCrop(undefined);
  };

  const resetIgnoreBlocks = () => {
    if (currentBaseLineDetails && currentBaseLineDetails.ignoreBoxes) {
      const existingIgnoreBlocks = currentBaseLineDetails.ignoreBoxes.map((block) => ({
        unit: '%',
        x: block.left,
        y: block.top,
        width: 100 - (block.left + block.right),
        height: 100 - (block.top + block.bottom),
      }));
      setRegions(existingIgnoreBlocks);
    } else {
      setRegions([]);
    }
    setEditing(false);
    setActiveIndex(null);
    setCrop(undefined);
  };

  const onCropChange = (c) => {
    setCrop(c);
  };

  const onCropComplete = (c) => {
    if (c.width && c.height) {
      const newRegions = [...regions];
      if (activeIndex !== null) {
        newRegions[activeIndex] = c;
      } else {
        newRegions.push(c);
      }
      setRegions(newRegions);
      // Reset after adding/updating
      setCrop(undefined);
      setActiveIndex(null);
    }
  };

  const startEditRegion = (index, e) => {
    if (!editing) return;
    e.stopPropagation(); // prevent ReactCrop from starting a new crop immediately if overlapping
    setActiveIndex(index);
    setCrop(regions[index]);
  };

  const deleteRegion = (index, e) => {
    e.stopPropagation();
    const newRegions = regions.filter((_, i) => i !== index);
    setRegions(newRegions);
    if (activeIndex === index) {
      setActiveIndex(null);
      setCrop(undefined);
    } else if (activeIndex > index) {
      setActiveIndex(activeIndex - 1);
    }
  };

  const renderOverlayRegions = () => regions.map((region, index) => {
    // If this region is currently being edited (active), don't show the overlay
    if (index === activeIndex) return null;

    return (
      <div
        key={index}
        onClick={(e) => startEditRegion(index, e)}
        style={{
          position: 'absolute',
          left: `${region.x}%`,
          top: `${region.y}%`,
          width: `${region.width}%`,
          height: `${region.height}%`,
          border: '1px solid #00ff50',
          background: 'rgba(0, 255, 80, 0.3)',
          cursor: editing ? 'pointer' : 'default',
          zIndex: 10,
        }}
      >
        {editing && (
          <div style={{ position: 'absolute', right: 0, bottom: '-25px' }}>
            <span
              className="remove-region-icon"
              type="button"
              onClick={(e) => deleteRegion(index, e)}
            >
              <RiDeleteBin6Line className="baseline-action-icon" />
            </span>
          </div>
        )}
      </div>
    );
  });

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
              <div style={{ display: 'block', position: 'relative' }}>
                <div style={{ flexGrow: 1, flexShrink: 1, width: '100%' }}>
                  {editing ? (
                    <ReactCrop
                      crop={crop}
                      onChange={onCropChange}
                      onComplete={onCropComplete}
                      disabled={!editing}
                    >
                      <img
                        ref={imgRef}
                        className="screenshot"
                        src={imageToDisplay}
                        alt="Compare"
                        width="100%"
                      />
                      {renderOverlayRegions()}
                    </ReactCrop>
                  ) : (
                    <div style={{ position: 'relative' }}>
                      <img
                        className="screenshot"
                        src={imageToDisplay}
                        alt="Compare"
                        width="100%"
                      />
                      {renderOverlayRegions()}
                    </div>
                  )}
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
