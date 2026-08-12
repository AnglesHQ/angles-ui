import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  Button,
  Checkbox,
  InputNumber,
  Loader,
  Stack,
} from 'rsuite';
import ScreenshotDetailsTable from '../ScreenshotDetailsTable';
import CurrentScreenshotContext from '../../../../context/CurrentScreenshotContext';
import Message from '../../../common/Message';

const FindImageView = function (props) {
  const intl = useIntl();
  const { isBaseline } = props;
  const {
    currentScreenshot,
    currentScreenshotDetails,
  } = useContext(CurrentScreenshotContext);

  const [templateFile, setTemplateFile] = useState(null);
  const [templatePreview, setTemplatePreview] = useState(null);
  const [minConfidence, setMinConfidence] = useState(0.8);
  const [maxMatches, setMaxMatches] = useState(5);
  const [grayscale, setGrayscale] = useState(false);
  const [searching, setSearching] = useState(false);
  const [findResult, setFindResult] = useState(null);
  const [findError, setFindError] = useState(null);

  // A new screenshot invalidates any previous search result (but the chosen template is
  // kept, so the same asset can be checked across several screenshots quickly).
  useEffect(() => {
    setFindResult(null);
    setFindError(null);
  }, [currentScreenshotDetails]);

  useEffect(() => () => {
    if (templatePreview) URL.revokeObjectURL(templatePreview);
  }, [templatePreview]);

  const handleTemplateChange = (event) => {
    const [file] = event.target.files;
    if (!file) return;
    setTemplateFile(file);
    setTemplatePreview(URL.createObjectURL(file));
    setFindResult(null);
    setFindError(null);
  };

  const findTemplate = () => {
    const formData = new FormData();
    formData.append('template', templateFile);
    setSearching(true);
    setFindResult(null);
    setFindError(null);
    // The published angles-javascript-client upload helpers are Node-only (they stream
    // from the filesystem), so the browser upload goes through axios directly.
    axios.post(`screenshot/${currentScreenshotDetails._id}/find`, formData, {
      params: { minConfidence, maxMatches, grayscale },
    })
      .then((response) => {
        setFindResult(response.data);
      })
      .catch((error) => {
        const data = error.response && error.response.data;
        setFindError((data && data.message) || error.message);
      })
      .finally(() => setSearching(false));
  };

  const renderMatchOverlays = () => {
    if (!findResult || findResult.matches.length === 0) return null;
    const { width: imageWidth, height: imageHeight } = findResult.imageDimensions;
    return findResult.matches.map((match, index) => (
      <div
        // eslint-disable-next-line react/no-array-index-key
        key={index}
        className="find-image-match-box"
        style={{
          left: `${(match.x / imageWidth) * 100}%`,
          top: `${(match.y / imageHeight) * 100}%`,
          width: `${(match.width / imageWidth) * 100}%`,
          height: `${(match.height / imageHeight) * 100}%`,
        }}
      >
        <span className="find-image-match-label">
          {`${(match.confidence * 100).toFixed(1)}%`}
        </span>
      </div>
    ));
  };

  const renderMatchesTable = () => {
    if (!findResult) return null;
    if (findResult.matches.length === 0) {
      return (
        <Message
          type="info"
          message={<FormattedMessage id="common.component.screenshot-view.tabs.find-image.message.no-matches" />}
        />
      );
    }
    return (
      <table className="find-image-matches-table">
        <thead>
          <tr>
            <th><FormattedMessage id="common.component.screenshot-view.tabs.find-image.label.matches" /></th>
            <th><FormattedMessage id="common.component.screenshot-view.tabs.find-image.label.position" /></th>
            <th><FormattedMessage id="common.component.screenshot-view.tabs.find-image.label.size" /></th>
            <th><FormattedMessage id="common.component.screenshot-view.tabs.find-image.label.confidence" /></th>
            <th><FormattedMessage id="common.component.screenshot-view.tabs.find-image.label.scale" /></th>
          </tr>
        </thead>
        <tbody>
          {findResult.matches.map((match, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{`${match.x}, ${match.y}`}</td>
              <td>{`${match.width} x ${match.height}`}</td>
              <td>{`${(match.confidence * 100).toFixed(1)}%`}</td>
              <td>{`${match.scale}x`}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  if (!currentScreenshot || !currentScreenshotDetails) {
    return (
      <Message
        type="info"
        message={(
          <span>
            <Loader />
            <FormattedMessage id="common.component.screenshot-view.tabs.screenshot.message.retrieving-screenshot" />
          </span>
        )}
      />
    );
  }

  return (
    <table className="baseline-compare-table screenshot-table">
      <tbody>
        <tr>
          <td colSpan="100%" className="baseline-compare-header">
            <FormattedMessage id="common.component.screenshot-view.tabs.find-image.message.intro" />
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
            <div className="find-image-controls">
              <Stack direction="column" alignItems="flex-start" spacing={12}>
                <label className="find-image-control-label" htmlFor="find-image-template-input">
                  <FormattedMessage id="common.component.screenshot-view.tabs.find-image.label.template" />
                  <input
                    id="find-image-template-input"
                    type="file"
                    accept="image/*"
                    onChange={handleTemplateChange}
                  />
                </label>
                {
                  templatePreview ? (
                    <img
                      className="find-image-template-preview"
                      src={templatePreview}
                      alt={intl.formatMessage({ id: 'common.component.screenshot-view.tabs.find-image.label.template' })}
                    />
                  ) : null
                }
                <label className="find-image-control-label" htmlFor="find-image-min-confidence">
                  <FormattedMessage id="common.component.screenshot-view.tabs.find-image.label.min-confidence" />
                  <InputNumber
                    id="find-image-min-confidence"
                    min={0.1}
                    max={1}
                    step={0.05}
                    value={minConfidence}
                    onChange={(value) => setMinConfidence(Number(value))}
                  />
                </label>
                <label className="find-image-control-label" htmlFor="find-image-max-matches">
                  <FormattedMessage id="common.component.screenshot-view.tabs.find-image.label.max-matches" />
                  <InputNumber
                    id="find-image-max-matches"
                    min={1}
                    max={25}
                    value={maxMatches}
                    onChange={(value) => setMaxMatches(Number(value))}
                  />
                </label>
                <Checkbox
                  checked={grayscale}
                  onChange={(value, checked) => setGrayscale(checked)}
                >
                  <FormattedMessage id="common.component.screenshot-view.tabs.find-image.label.grayscale" />
                </Checkbox>
                <Button
                  type="button"
                  className="btn-primary"
                  disabled={!templateFile || searching}
                  onClick={() => findTemplate()}
                >
                  <FormattedMessage id="common.component.screenshot-view.tabs.find-image.button.find" />
                </Button>
              </Stack>
            </div>
          </td>
          <td>
            {
              searching ? (
                <Message
                  type="info"
                  message={(
                    <span>
                      <Loader />
                      <FormattedMessage id="common.component.screenshot-view.tabs.find-image.message.searching" />
                    </span>
                  )}
                />
              ) : null
            }
            {
              findError ? (
                <Message type="warning" message={<span>{findError}</span>} />
              ) : null
            }
            <div className="find-image-screenshot-container">
              <img
                className="screenshot"
                src={currentScreenshot}
                alt="Screenshot"
                width="100%"
              />
              {renderMatchOverlays()}
            </div>
            {renderMatchesTable()}
          </td>
        </tr>
      </tbody>
    </table>
  );
};

export default FindImageView;
