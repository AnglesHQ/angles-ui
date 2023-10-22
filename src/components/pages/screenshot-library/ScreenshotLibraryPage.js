import React, { useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { FormattedMessage, useIntl } from 'react-intl';
import queryString from 'query-string';
import { ScreenshotRequests } from 'angles-javascript-client';
import {
  Button,
  SelectPicker,
  Panel,
  Affix,
  Stack,
  Input,
  InputGroup,
} from 'rsuite';
import ScreenshotView from '../../common/screenshot-view/ScreenshotView';
import CurrentScreenshotContext from '../../../context/CurrentScreenshotContext';

const ScreenshotLibraryPage = function () {
  const location = useLocation();
  const query = queryString.parse(location.search);
  const [groupedScreenshots, setGroupedScreenshots] = useState(null);
  const [filteredScreenshots, setFilteredScreenshots] = useState(null);
  const [retrievingScreenshots, setRetrievingScreenshots] = useState(false);
  const [platforms, setPlatforms] = useState(null);
  const [groupType, setGroupType] = useState(null);
  const [selectedTab] = useState(query.selectedTab || 'image');
  const [view, setView] = useState('');
  const [tag, setTag] = useState('');
  const [numberOfDays, setNumberOfDays] = useState(14);
  const [selectedPlatform, setSelectedPlatform] = useState(undefined);
  const screenshotRequests = new ScreenshotRequests(axios);
  const {
    setCurrentScreenshotId,
  } = useContext(CurrentScreenshotContext);
  const getGroupedScreenshotByPlatform = (viewValue, numberOfDaysValue) => {
    setRetrievingScreenshots(true);
    setFilteredScreenshots(null);
    setSelectedPlatform(null);
    screenshotRequests
      .getScreenshotsGroupedByPlatform(viewValue, numberOfDaysValue)
      .then((retrievedGroupedScreenshots) => {
        setView(viewValue);
        setNumberOfDays(numberOfDaysValue);
        setGroupType('view');
        setGroupedScreenshots(retrievedGroupedScreenshots);
        setFilteredScreenshots(retrievedGroupedScreenshots);
        setRetrievingScreenshots(false);
        setCurrentScreenshotId(retrievedGroupedScreenshots[0]._id);
      })
      .catch(() => {
        setRetrievingScreenshots(false);
      });
  };

  const getGroupedScreenshotByTag = (tagValue, numberOfDaysValue) => {
    setRetrievingScreenshots(true);
    setFilteredScreenshots(null);
    setSelectedPlatform(null);
    screenshotRequests.getScreenshotsGroupedByTag(tagValue, numberOfDaysValue)
      .then((retrievedGroupedScreenshots) => {
        const uniquePlatforms = [];
        retrievedGroupedScreenshots.forEach((screenshot) => {
          if (!uniquePlatforms.includes(screenshot.platformId)) {
            uniquePlatforms.push(screenshot.platformId);
          }
        });
        uniquePlatforms.sort();
        const filteredScreenshotsToStore = retrievedGroupedScreenshots
          .filter((screenshot) => screenshot.platformId === uniquePlatforms[0]);
        setTag(tagValue);
        setNumberOfDays(numberOfDaysValue);
        setGroupType('tag');
        setGroupedScreenshots(retrievedGroupedScreenshots);
        setFilteredScreenshots(filteredScreenshotsToStore);
        setCurrentScreenshotId(filteredScreenshotsToStore[0]._id);
        setRetrievingScreenshots(false);
        setPlatforms(uniquePlatforms);
      })
      .catch(() => {
        setRetrievingScreenshots(false);
      });
  };

  useEffect(() => {
    if (query.view) {
      getGroupedScreenshotByPlatform(
        query.view,
        query.numberOfDays ? (query.numberOfDays) : numberOfDays,
      );
    } else if (query.tag) {
      getGroupedScreenshotByTag(
        query.tag,
        query.numberOfDays ? (query.numberOfDays) : numberOfDays,
      );
    }
  }, []);

  const handleViewChange = (event) => {
    setView(event);
    setTag('');
  };

  const handleTagChange = (event) => {
    setTag(event);
    setView('');
  };

  const handleNumberOfDaysChange = (event) => {
    setNumberOfDays(event);
  };

  const submitScreenshotSearch = () => {
    // event.preventDefault();
    setFilteredScreenshots(null);
    if (view !== '') {
      getGroupedScreenshotByPlatform(view, numberOfDays);
    } else if (tag !== '') {
      getGroupedScreenshotByTag(tag, numberOfDays);
    }
  };

  const filterByPlatform = (event) => {
    const filteredScreenshotsToStore = groupedScreenshots
      .filter((screenshot) => screenshot.platformId === event);
    setFilteredScreenshots(filteredScreenshotsToStore);
    setSelectedPlatform(event);
  };

  const getNumberOfDaysData = () => {
    const numberOfDaysData = [];
    numberOfDaysData.push({ value: 1, label: <FormattedMessage id="page.screenshot-library.search-options.dropdown.yesterday" /> });
    numberOfDaysData.push({ value: 7, label: <FormattedMessage id="page.screenshot-library.search-options.dropdown.last-7-days" /> });
    numberOfDaysData.push({ value: 14, label: <FormattedMessage id="page.screenshot-library.search-options.dropdown.last-14-days" /> });
    numberOfDaysData.push({ value: 30, label: <FormattedMessage id="page.screenshot-library.search-options.dropdown.last-30-days" /> });
    numberOfDaysData.push({ value: 90, label: <FormattedMessage id="page.screenshot-library.search-options.dropdown.last-3-months" /> });
    numberOfDaysData.push({ value: 180, label: <FormattedMessage id="page.screenshot-library.search-options.dropdown.last-6-months" /> });
    return numberOfDaysData;
  };

  const getPlatformData = () => platforms.map((platform) => ({ value: platform, label: platform }));

  const intl = useIntl();

  return (
    <div>
      <Affix top={25}>
        <Stack className="top-menu-stack" spacing={10}>
          <span>Search by: </span>
          <InputGroup className="screenshot-view-or-tag-input">
            <Input
              name="view"
              value={view}
              onChange={handleViewChange}
              placeholder={intl.formatMessage({ id: 'page.screenshot-library.search-options.label.view' })}
            />
            <InputGroup.Addon>
              <FormattedMessage id="page.screenshot-library.search-options.label.or" />
            </InputGroup.Addon>
            <Input
              name="tag"
              value={tag}
              onChange={handleTagChange}
              placeholder={intl.formatMessage({ id: 'page.screenshot-library.search-options.label.tag' })}
            />
          </InputGroup>
          <SelectPicker
            className="number-of-days-picker"
            name="numberOfDays"
            data={getNumberOfDaysData()}
            value={numberOfDays}
            onChange={handleNumberOfDaysChange}
            label={(
              <FormattedMessage
                id="page.screenshot-library.search-options.label.period"
              />
            )}
          />
          <Button
            disabled={view === '' && tag === ''}
            className="filter-submit-button"
            type="submit"
            onClick={() => { submitScreenshotSearch(); }}
          >
            <FormattedMessage id="page.screenshot-library.search-options.button.search-screenshots" />
          </Button>
        </Stack>
      </Affix>
      <Panel className="screenshot-viewer-surround">
        {
          groupType === 'tag' && platforms && platforms.length > 0 ? (
            <SelectPicker
              className="platform-picker"
              name="platformSelect"
              data={getPlatformData()}
              value={selectedPlatform}
              onChange={filterByPlatform}
              label={(
                <FormattedMessage
                  id="page.screenshot-library.search-options.label.platform"
                />
              )}
            />
          ) : null
        }
        {
          retrievingScreenshots ? (
            <div className="alert alert-primary" role="alert">
              <span>
                <i className="fas fa-spinner fa-pulse fa-2x" />
                <span> Retrieving screenshot details.</span>
              </span>
            </div>
          ) : null
        }
        {
          retrievingScreenshots === false
            && (filteredScreenshots === undefined || (Array.isArray(filteredScreenshots)
            && filteredScreenshots.length === 0)) ? (
              <div className="alert alert-primary" role="alert">
                <span>
                  <span>No images to display.</span>
                </span>
              </div>
            ) : null
        }
        {
          retrievingScreenshots === false && filteredScreenshots
          && Array.isArray(filteredScreenshots) && filteredScreenshots.length > 0 ? (
            <ScreenshotView
              buildScreenshots={filteredScreenshots}
              selectedScreenshotId={filteredScreenshots[0]._id}
              selectedTab={selectedTab}
            />
            ) : null
        }
      </Panel>
    </div>
  );
};

export default ScreenshotLibraryPage;
