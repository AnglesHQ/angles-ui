import React, { useState } from 'react';
import { BaselineRequests, ScreenshotRequests } from 'angles-javascript-client';
import axios from 'axios';
import { encode as btoa } from 'base-64';

const CurrentScreenshotContext = React.createContext();

export function CurrentScreenshotProvider({ children }) {
  const screenshotRequests = new ScreenshotRequests(axios);
  const baselineRequests = new BaselineRequests(axios);
  const [currentScreenshotId, setCurrentScreenshotId] = React.useState({});
  const [currentScreenshot, setCurrentScreenshot] = useState(null);
  const [currentScreenshotDetails, setCurrentScreenshotDetails] = useState(null);
  const [currentScreenshotHistory, setCurrentScreenshotHistory] = useState(null);
  const [currentBaseline, setCurrentBaseline] = useState(null);
  const [currentBaseLineDetails, setCurrentBaseLineDetails] = useState(null);
  const [currentBaselineCompare, setCurrentBaselineCompare] = useState(null);
  const [currentBaselineCompareJson, setCurrentBaselineCompareJson] = useState(null);

  const isBaseline = (screenshotId) => (currentBaseLineDetails && currentBaseLineDetails.screenshot
    && currentBaseLineDetails.screenshot._id === screenshotId);

  const getScreenshotHistoryByView = (view, platformId, limit, offset) => {
    screenshotRequests.getScreenshotHistoryByView(view, platformId, limit, offset)
      .then((retrievedScreenshotHistory) => {
        setCurrentScreenshotHistory(retrievedScreenshotHistory);
      });
  };

  const getBaselineScreenshot = (screenshotId) => {
    screenshotRequests.getScreenshotImage(screenshotId)
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
  };

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
          // handleSelect('image');
        }
      });
  };

  // Used to retrieve the screenshot image
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
        setCurrentScreenshot('ERROR');
      });
  };

  const loadScreenshot = (screenshotId) => {
    if (!currentScreenshotDetails || currentScreenshotDetails._id !== screenshotId) {
      setCurrentScreenshot(null);
      setCurrentBaseline(null);
      setCurrentScreenshotHistory(null);
      setCurrentBaselineCompare(null);
      getScreenshotDetails(screenshotId);
      getScreenshot(screenshotId);
    }
  };

  const getBaselineCompare = (screenshotId, useCache) => {
    screenshotRequests.getBaselineCompareImage(screenshotId, useCache)
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

  const getBaselineCompareJson = (screenshotId) => {
    screenshotRequests.getBaselineCompare(screenshotId)
      .then((retrievedBaselineCompareJson) => {
        setCurrentBaselineCompareJson(retrievedBaselineCompareJson);
      })
      .catch(() => {
        // failed to retrieve baseline.
        setCurrentBaselineCompareJson({});
      });
  };

  const makeUpdateBaselineRequest = (baselineId, screenshotId, ignoreBoxes) => baselineRequests
    .updateBaseline(baselineId, screenshotId, ignoreBoxes)
    .then((retrievedBaselineDetails) => {
      setCurrentBaseLineDetails(retrievedBaselineDetails);
    });

  const forceBaselineCompare = (screenshotId) => getBaselineCompare(screenshotId, false);

  const updateBaseline = (screenshot) => {
    let updateBaselinePromise;
    if (currentBaseLineDetails) {
      // if there is already a baseline we need to update it.
      updateBaselinePromise = makeUpdateBaselineRequest(currentBaseLineDetails._id, screenshot._id);
    } else {
      // create a new baseline
      // updateBaselinePromise = setBaselineForView(screenshot);
    }
    return updateBaselinePromise;
  };

  const value = React.useMemo(
    () => (
      {
        currentScreenshotId,
        setCurrentScreenshotId,
        currentScreenshot,
        setCurrentScreenshot,
        currentScreenshotDetails,
        setCurrentScreenshotDetails,
        currentScreenshotHistory,
        setCurrentScreenshotHistory,
        currentBaseline,
        setCurrentBaseline,
        currentBaseLineDetails,
        setCurrentBaseLineDetails,
        currentBaselineCompare,
        setCurrentBaselineCompare,
        currentBaselineCompareJson,
        setCurrentBaselineCompareJson,
        getScreenshotHistoryByView,
        getBaselineScreenshot,
        getBaseLineDetails,
        forceBaselineCompare,
        getBaselineCompare,
        getBaselineCompareJson,
        makeUpdateBaselineRequest,
        updateBaseline,
        loadScreenshot,
        isBaseline,
      }
    ),
    [
      currentScreenshotId,
      currentScreenshot,
      currentScreenshotDetails,
      currentScreenshotHistory,
      currentBaseline,
      currentBaseLineDetails,
      currentBaselineCompare,
      currentBaselineCompareJson,
    ],
  );
  return (
    <CurrentScreenshotContext.Provider value={value}>
      { children }
    </CurrentScreenshotContext.Provider>
  );
}

export default CurrentScreenshotContext;
