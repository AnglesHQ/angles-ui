import React, { useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { FormattedMessage } from 'react-intl';
import queryString from 'query-string';
import { ScreenshotRequests } from 'angles-javascript-client';
import {
  Form,
  Button,
  ButtonToolbar,
  SelectPicker,
  Panel,
  Divider,
  FlexboxGrid,
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
  const screenshotRequests = new ScreenshotRequests(axios);
  const {
    setCurrentScreenshotId,
  } = useContext(CurrentScreenshotContext);
  const getGroupedScreenshotByPlatform = (viewValue, numberOfDaysValue) => {
    setRetrievingScreenshots(true);
    setFilteredScreenshots(null);
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

  return (
    <div>
      <Panel className="screenshot-library-panel">
        <Form onSubmit={submitScreenshotSearch} className="screenshot-library-form">
          <FlexboxGrid>
            <FlexboxGrid.Item colspan={11}>
              <Form.Group controlId="view">
                <Form.ControlLabel>
                  <FormattedMessage id="page.screenshot-library.search-options.label.view" />
                </Form.ControlLabel>
                <Form.Control name="view" value={view} onChange={handleViewChange} />
                <Form.HelpText>
                  <FormattedMessage id="page.screenshot-library.search-options.label.view-or-tag" />
                </Form.HelpText>
              </Form.Group>
            </FlexboxGrid.Item>
            <FlexboxGrid.Item colspan={2} className="screenshot-library-form-or">
              <span>
                <FormattedMessage id="page.screenshot-library.search-options.label.or" />
              </span>
            </FlexboxGrid.Item>
            <FlexboxGrid.Item colspan={11}>
              <Form.Group controlId="tag">
                <Form.ControlLabel>
                  <FormattedMessage id="page.screenshot-library.search-options.label.tag" />
                </Form.ControlLabel>
                <Form.Control name="tag" value={tag} onChange={handleTagChange} />
              </Form.Group>
            </FlexboxGrid.Item>
          </FlexboxGrid>
          <FlexboxGrid className="screenshot-form-second-row">
            <FlexboxGrid.Item colspan={11}>
              <Form.Group controlId="numberOfDays">
                <Form.ControlLabel>
                  <FormattedMessage id="page.screenshot-library.search-options.label.period" />
                </Form.ControlLabel>
                <SelectPicker
                  className="number-of-days-picker"
                  name="numberOfDays"
                  data={getNumberOfDaysData()}
                  value={numberOfDays}
                  onChange={handleNumberOfDaysChange}
                  cleanable={false}
                  searchable={false}
                />
              </Form.Group>
            </FlexboxGrid.Item>
            <FlexboxGrid.Item colspan={2} />
            <FlexboxGrid.Item colspan={11}>
              {
                groupType === 'tag' && platforms && platforms.length > 0 ? (
                  <Form.Group controlId="platformSelect">
                    <Form.ControlLabel>
                      <FormattedMessage id="page.screenshot-library.search-options.label.platform" />
                    </Form.ControlLabel>
                    <SelectPicker
                      className="platform-picker"
                      name="platformSelect"
                      data={getPlatformData()}
                      value={numberOfDays}
                      onChange={filterByPlatform}
                    />
                  </Form.Group>
                ) : null
              }
            </FlexboxGrid.Item>
          </FlexboxGrid>
          <Divider />
          <Form.Group>
            <ButtonToolbar>
              <Button disabled={view === '' && tag === ''} appearance="primary" type="submit">
                <FormattedMessage id="page.screenshot-library.search-options.button.search-screenshots" />
              </Button>
            </ButtonToolbar>
          </Form.Group>
        </Form>
      </Panel>
      <div className="screenshot-viewer-surround">
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
      </div>
    </div>
  );
};

export default ScreenshotLibraryPage;
