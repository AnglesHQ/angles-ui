import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { connect } from 'react-redux';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import Alert from 'react-bootstrap/Alert';
import { useNavigate } from 'react-router-dom';
import { encode as btoa } from 'base-64';
import { BaselineRequests, ScreenshotRequests } from 'angles-javascript-client';
import ImageCarousel from '../elements/ImageCarousel';
import CurrentImageView from '../elements/CurrentImageView';
import BaselineImageView from '../elements/BaselineImageView';
import ImageSideBySideView from '../elements/ImageSideBySideView';
import ScreenshotHistoryView from '../elements/ScreenshotHistoryView';
import 'react-multi-carousel/lib/styles.css';
import './Default.css';
import { storeCurrentErrorMessage, storeCurrentInfoMessage, storeCurrentLoaderMessage } from '../../redux/notificationActions';

const ScreenshotView = function (props) {
  const { buildScreenshots: propsBuildScreenshots } = props;
  const [buildScreenshots, setBuildScreenshots] = useState(propsBuildScreenshots);
  const [currentScreenshot, setCurrentScreenshot] = useState(null);
  const [currentScreenshotDetails, setCurrentScreenshotDetails] = useState(null);
  const [currentScreenshotHistory, setCurrentScreenshotHistory] = useState(null);
  const [currentBaseline, setCurrentBaseline] = useState(null);
  const [currentBaseLineDetails, setCurrentBaseLineDetails] = useState(null);
  const [currentBaselineCompare, setCurrentBaselineCompare] = useState(null);
  const [currentBaselineCompareJson, setCurrentBaselineCompareJson] = useState(null);
  const [key, setKey] = useState('image');
  const screenshotRequests = new ScreenshotRequests(axios);
  const baselineRequests = new BaselineRequests(axios);

  const isBaseline = (screenshotId) => (currentBaseLineDetails && currentBaseLineDetails.screenshot
    && currentBaseLineDetails.screenshot._id === screenshotId);

  const handleSelect = (value) => {
    if (['image', 'history', 'baseline', 'sidebyside'].includes(value)) {
      setKey(value);
    }
  };

  const setTab = (keyToSelect) => {
    handleSelect(keyToSelect);
  };

  const getScreenshotHistoryByView = (view, platformId, limit, offset) => {
    screenshotRequests.getScreenshotHistoryByView(view, platformId, limit, offset)
      .then((retrievedScreenshotHistory) => {
        setCurrentScreenshotHistory(retrievedScreenshotHistory);
      });
  };

  const getBaselineScreenshot = (screenshotId) => screenshotRequests
    .getScreenshotImage(screenshotId)
    .then((screenshot) => {
      const base64 = btoa(
        new Uint8Array(screenshot).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          '',
        ),
      );
      setCurrentBaseline(`data:;base64,${base64}`);
    }).catch(() => {
      // failed to retrieve baseline.
      setCurrentBaseline('ERROR');
    });

  const getBaseLineDetails = (screenshot) => {
    baselineRequests.getBaselineForScreenshot(screenshot)
      .then((baselines) => {
        // there should only be one
        const baseline = baselines[0];
        // to handle better in the future
        setCurrentBaseLineDetails(baseline);
        if (baseline && baseline.screenshot._id) {
          getBaselineScreenshot(baseline.screenshot._id);
        }
      });
  };

  const getScreenshotDetails = (screenshotId) => {
    screenshotRequests.getScreenshot(screenshotId)
      .then((retrievedScreenshotDetails) => {
        setCurrentScreenshotDetails(retrievedScreenshotDetails);
        if (retrievedScreenshotDetails && retrievedScreenshotDetails.view) {
          // if there is a view, retrieve the history
          getScreenshotHistoryByView(
            retrievedScreenshotDetails.view,
            retrievedScreenshotDetails.platformId,
            10,
          );
          if (retrievedScreenshotDetails.platform) {
            getBaseLineDetails(retrievedScreenshotDetails);
          }
        } else if (retrievedScreenshotDetails != null) {
          handleSelect('image');
        }
      });
  };

  const getScreenshot = (screenshotId) => {
    screenshotRequests.getScreenshotImage(screenshotId)
      .then((screenshot) => {
        const base64 = btoa(
          new Uint8Array(screenshot).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            '',
          ),
        );
        setCurrentScreenshot(`data:;base64,${base64}`);
      }).catch(() => {
        // failed to retrieve baseline.
        setCurrentScreenshot('ERROR');
      });
  };

  const loadScreenshot = (screenshotId) => {
    if (currentScreenshotDetails === undefined || currentScreenshotDetails._id !== screenshotId) {
      setCurrentScreenshot(null);
      setCurrentBaseline(null);
      setCurrentScreenshotHistory(null);
      setCurrentBaselineCompare(null);
      getScreenshotDetails(screenshotId);
      getScreenshot(screenshotId);
    }
  };

  useEffect(() => {
    const { selectedScreenshotId, selectedTab } = props;
    loadScreenshot(selectedScreenshotId);
    if (selectedTab) {
      handleSelect(selectedTab);
    }
  }, []);

  const getBaselineCompare = (screenshotId, useCache) => {
    screenshotRequests
      .getBaselineCompareImage(screenshotId, useCache)
      .then((screenshot) => {
        const base64 = btoa(
          new Uint8Array(screenshot).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            '',
          ),
        );
        setCurrentBaselineCompare(`data:;base64,${base64}`);
      })
      .catch(() => {
        // failed to retrieve baseline.
        setCurrentBaselineCompare('ERROR');
      });
  };

  const getBaselineCompareJson = (screenshotId) => screenshotRequests
    .getBaselineCompare(screenshotId)
    .then((retrievedBaselineCompareJson) => {
      setCurrentBaselineCompareJson(retrievedBaselineCompareJson);
    })
    .catch(() => {
      // failed to retrieve baseline.
      setCurrentBaselineCompareJson({});
    });

  const loadFirstScreenshot = () => {
    if (buildScreenshots !== undefined && buildScreenshots.length > 0) {
      loadScreenshot(buildScreenshots[0]._id);
    }
  };

  const deleteScreenshot = (screenshot) => {
    const {
      storeErrorMessage,
      storeInfoMessage,
      storeLoaderMessage,
      removeImageFromBuildScreenshots,
    } = props;
    storeLoaderMessage({ title: 'Deleting screenshot', body: `Deleting screenshot with id ${screenshot._id}` });
    screenshotRequests.deleteScreenshot(screenshot._id)
      .then((result) => {
        const messageBody = (<div>{result.message}</div>);
        storeInfoMessage({ title: 'Delete Screenshot', body: messageBody });
        removeImageFromBuildScreenshots(screenshot);
        loadFirstScreenshot();
      })
      .catch((error) => {
        const { response: { data } } = error;
        if (data && data.message) {
          storeErrorMessage({ title: 'Unable to delete image', body: data.message });
        } else {
          storeErrorMessage({ title: 'Unable to delete image', body: error.message });
        }
      });
  };

  const setBaselineForView = (screenshot) => baselineRequests.setBaseline(screenshot)
    .then((retrieveBaselineDetails) => {
      setCurrentBaseLineDetails(retrieveBaselineDetails);
    });

  // eslint-disable-next-line no-unused-vars
  const forceBaselineCompare = (screenshotId) => getBaselineCompare(screenshotId, false);

  const makeUpdateBaselineRequest = (baselineId, screenshotId, ignoreBoxes) => baselineRequests
    .updateBaseline(baselineId, screenshotId, ignoreBoxes)
    .then((retrievedBaselineDetails) => {
      setCurrentBaseLineDetails(retrievedBaselineDetails);
    });

  const updateBaseline = (screenshot) => {
    const { storeErrorMessage, storeInfoMessage } = props;
    let updateBaselinePromise;
    if (currentBaseLineDetails) {
      // if there is already a baseline we need to update it.
      updateBaselinePromise = makeUpdateBaselineRequest(currentBaseLineDetails._id, screenshot._id);
    } else {
      // create a new baseline
      updateBaselinePromise = setBaselineForView(screenshot);
    }
    updateBaselinePromise
      .then(() => {
        const messageBody = (<div>Updated Baseline Image</div>);
        storeInfoMessage({ title: 'Baseline Configured', body: messageBody });
      })
      .catch((error) => {
        const { response: { data } } = error;
        if (data && data.message) {
          storeErrorMessage({ title: 'Unable to set baseline', body: data.message });
        } else {
          storeErrorMessage({ title: 'Unable to set baseline', body: error.message });
        }
      });
  };

  const generateDynamicBaseline = (screenshot) => {
    const { storeErrorMessage, storeInfoMessage, storeLoaderMessage } = props;
    const { _id: screenshotId } = screenshot;
    storeLoaderMessage({ title: 'Creating dynamic baseline...', body: 'Creating dynamic baseline. This could take a few seconds.' });
    return screenshotRequests.getDynamicBaselineImage(screenshotId, 5)
      .then((baselineImage) => {
        const { _id: baselineId } = baselineImage;
        loadScreenshot(baselineId);
        const { addImageToBuildScreenshots } = props;
        addImageToBuildScreenshots(baselineImage);
        const messageBody = (
          <div>
            {`Created dynamic baseline image for view ${baselineImage.view} and platform id ${baselineImage.platformId}`}
            <img src={baselineImage.thumbnail} alt={baselineImage.view} />
          </div>
        );
        const messageActions = [];
        messageActions.push({ text: 'Set As Baseline', method: (() => updateBaseline(baselineImage)) });
        messageActions.push({ text: 'Delete Image', method: (() => deleteScreenshot(baselineImage)) });
        storeInfoMessage({ title: 'Created dynamic baseline', body: messageBody, actions: messageActions });
        return baselineImage;
      })
      .catch((error) => {
        const { response: { data } } = error;
        if (data && data.message) {
          storeErrorMessage({ title: 'Unable to generate dynamic baseline', body: data.message });
        } else {
          storeErrorMessage({ title: 'Unable to generate dynamic baseline', body: error.message });
        }
        return undefined;
      });
  };

  useEffect(() => {
    setBuildScreenshots(propsBuildScreenshots);
    loadScreenshot(propsBuildScreenshots[0]._id);
  }, [propsBuildScreenshots]);

  useEffect(() => {
    // if base line details have changed, load the new image
    if (currentBaseLineDetails && currentBaseLineDetails.screenshot) {
      getBaselineCompare(currentScreenshotDetails._id, true);
      getBaselineCompareJson(currentScreenshotDetails._id);
    } else {
      setCurrentBaselineCompare(null);
    }
  }, [currentBaseLineDetails]);

  // eslint-disable-next-line no-unused-vars
  const navigateToImage = (screenshotDetails) => {
    const navigate = useNavigate;
    const path = `/build/?buildId=${screenshotDetails.build}&loadScreenshotId=${screenshotDetails._id}`;
    navigate(path);
  };

  return (
    (!buildScreenshots || !currentScreenshotDetails) ? (
      <div className="alert alert-primary" role="alert">
        <span>
          <i className="fas fa-spinner fa-pulse fa-2x" />
          <span> Retrieving screenshot details.</span>
        </span>
      </div>
    ) : (
      <div>
        <ImageCarousel
          screenshots={buildScreenshots}
          selectedScreenshotDetails={currentScreenshotDetails}
          loadScreenshot={loadScreenshot}
        />
        {
          !currentScreenshotDetails.platform || !currentScreenshotDetails.view
            ? <Alert variant="info">To enable the &quot;History&quot; and &quot;Compare with Baseline&quot; tabs please provide a view and platform details when uploading the screenshots to angles.</Alert>
            : null
        }
        <Tabs id="image-tabs" activeKey={key} defaultActiveKey="image" onSelect={(tabKey, evt) => setTab(tabKey, evt)}>
          <Tab eventKey="image" title="Image">
            <div className="image-page-holder">
              <CurrentImageView
                currentScreenshot={currentScreenshot}
                currentScreenshotDetails={currentScreenshotDetails}
                updateBaseline={updateBaseline}
                generateDynamicBaseline={generateDynamicBaseline}
                deleteScreenshot={deleteScreenshot}
                isBaseline={isBaseline}
              />
            </div>
          </Tab>
          <Tab eventKey="history" disabled={!currentScreenshotDetails.platform || !currentScreenshotDetails.view} title="History">
            <div className="image-page-holder">
              <ScreenshotHistoryView
                currentScreenshotHistory={currentScreenshotHistory}
                currentScreenshotDetails={currentScreenshotDetails}
                currentBaseLineDetails={currentBaseLineDetails}
                isBaseline={isBaseline}
              />
            </div>
          </Tab>
          <Tab eventKey="baseline" title="Overlay with Baseline" disabled={!currentScreenshotDetails.platform || !currentScreenshotDetails.view}>
            <div className="image-page-holder">
              <BaselineImageView
                currentBaseLineDetails={currentBaseLineDetails}
                currentScreenshotDetails={currentScreenshotDetails}
                currentBaselineCompare={currentBaselineCompare}
                currentBaselineCompareJson={currentBaselineCompareJson}
                currentScreenshot={currentScreenshot}
                isBaseline={isBaseline}
                makeUpdateBaselineRequest={makeUpdateBaselineRequest}
                getBaselineCompare={getBaselineCompare}
              />
            </div>
          </Tab>
          <Tab eventKey="sidebyside" title="Side by Side with Baseline" disabled={!currentScreenshotDetails.platform || !currentScreenshotDetails.view}>
            <div className="image-page-holder">
              <ImageSideBySideView
                currentBaseLineDetails={currentBaseLineDetails}
                currentScreenshotDetails={currentScreenshotDetails}
                currentBaseline={currentBaseline}
                currentScreenshot={currentScreenshot}
                isBaseline={isBaseline}
              />
            </div>
          </Tab>
        </Tabs>
      </div>
    )
  );
};

const mapDispatchToProps = (dispatch) => ({
  storeErrorMessage: (currentErrorMessage) => dispatch(
    storeCurrentErrorMessage(currentErrorMessage),
  ),
  storeInfoMessage: (currentInfoMessage) => dispatch(
    storeCurrentInfoMessage(currentInfoMessage),
  ),
  storeLoaderMessage: (currentLoaderMessage) => dispatch(
    storeCurrentLoaderMessage(currentLoaderMessage),
  ),
});

const mapStateToProps = (state) => ({
  currentErrorMessage: state.notificationReducer.currentErrorMessage,
  currentInfoMessage: state.notificationReducer.currentInfoMessage,
  currentLoaderMessage: state.notificationReducer.currentLoaderMessage,
});

export default connect(mapStateToProps, mapDispatchToProps)(ScreenshotView);
