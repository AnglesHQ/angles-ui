import React, { useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { FormattedMessage, useIntl } from 'react-intl';
import { Container } from 'react-bootstrap';
import queryString from 'query-string';
import { ScreenshotRequests, MetricRequests } from 'angles-javascript-client';
import {
  Button,
  SelectPicker,
  Panel,
  Affix,
  Stack,
  InputGroup,
  AutoComplete,
  Col,
  Row,
} from 'rsuite';
import ScreenshotView from '../../common/screenshot-view/ScreenshotView';
import CurrentScreenshotContext from '../../../context/CurrentScreenshotContext';
import ScreenshotCard from '../../common/screenshot-view/ScreenshotCard';

const ScreenshotLibraryPage = function () {
  const location = useLocation();
  const query = queryString.parse(location.search);
  const [groupedScreenshots, setGroupedScreenshots] = useState(null);
  const [filteredScreenshots, setFilteredScreenshots] = useState(null);
  const [retrievingScreenshots, setRetrievingScreenshots] = useState(false);
  const [searchTriggered, setSearchTriggered] = useState(false);
  const [platforms, setPlatforms] = useState(null);
  const [groupType, setGroupType] = useState(null);
  const [selectedTab] = useState(query.selectedTab || 'image');
  const [view, setView] = useState('');
  const [autoCompleteViews, setAutoCompleteViews] = useState([]);
  const [tag, setTag] = useState('');
  const [screenshotMetrics, setScreenshotMetrics] = useState([]);
  const [autoCompleteTags, setAutoCompleteTags] = useState([]);
  const [numberOfDays, setNumberOfDays] = useState(14);
  const [selectedPlatform, setSelectedPlatform] = useState(undefined);
  const screenshotRequests = new ScreenshotRequests(axios);
  const metricRequests = new MetricRequests(axios);
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
    metricRequests.getScreenshotMetrics(undefined, undefined, 5, true)
      .then((retrievedScreenshotMetrics) => {
        setScreenshotMetrics(retrievedScreenshotMetrics);
      });
    if (query.view) {
      setSearchTriggered(true);
      getGroupedScreenshotByPlatform(
        query.view,
        query.numberOfDays ? (query.numberOfDays) : numberOfDays,
      );
    } else if (query.tag) {
      setSearchTriggered(true);
      getGroupedScreenshotByTag(
        query.tag,
        query.numberOfDays ? (query.numberOfDays) : numberOfDays,
      );
    }
  }, []);

  const handleViewChange = (event) => {
    setView(event);
    setTag('');
    setAutoCompleteTags([]);
    if (event && event.length >= 3) {
      screenshotRequests.getScreenshotViews(event, 15)
        .then((retrievedViews) => {
          setAutoCompleteViews(retrievedViews);
        });
    } else {
      setAutoCompleteViews([]);
    }
  };

  const handleTagChange = (event) => {
    setTag(event);
    setView('');
    setAutoCompleteViews([]);
    if (event && event.length >= 3) {
      screenshotRequests.getScreenshotTags(event, 15)
        .then((retrievedTags) => {
          setAutoCompleteTags(retrievedTags);
        });
    } else {
      setAutoCompleteTags([]);
    }
  };

  const handleNumberOfDaysChange = (event) => {
    setNumberOfDays(event);
  };

  const submitScreenshotSearch = () => {
    // event.preventDefault();
    setSearchTriggered(true);
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

  const addImageToBuildScreenshots = (screenshot) => {
    filteredScreenshots.push(screenshot);
    setFilteredScreenshots(filteredScreenshots);
  };

  const removeImageFromBuildScreenshots = (screenshotToRemove) => {
    const index = filteredScreenshots
      .findIndex((screenshot) => screenshot._id === screenshotToRemove._id);
    if (index > -1) {
      setFilteredScreenshots(filteredScreenshots.splice(index, 1));
    }
  };

  return (
    <div>
      <Affix top={25}>
        <Stack className="top-menu-stack" spacing={10}>
          <span>Search by: </span>
          <InputGroup className="screenshot-view-or-tag-input">
            <AutoComplete
              name="view"
              style={{ width: 224 }}
              data={autoCompleteViews}
              value={view}
              onChange={handleViewChange}
              placeholder={intl.formatMessage({ id: 'page.screenshot-library.search-options.label.view' })}
            />
            <InputGroup.Addon>
              <FormattedMessage id="page.screenshot-library.search-options.label.or" />
            </InputGroup.Addon>
            <AutoComplete
              name="tag"
              style={{ width: 224 }}
              data={autoCompleteTags}
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
              addImageToBuildScreenshots={addImageToBuildScreenshots}
              removeImageFromBuildScreenshots={removeImageFromBuildScreenshots}
            />
            ) : null
        }
      </Panel>
      {
        !searchTriggered ? (
          <Panel className="screenshot-viewer-metrics-panel" header="Top views and tags">
            <Row gutter={30}>
              <Col xs={12}>
                <div>
                  {
                    screenshotMetrics.views ? (
                      screenshotMetrics.views.map((viewObject, index) => (
                        <Container className="card-deck-history">
                          <div>
                            <span>
                              <FormattedMessage id="page.screenshot-library.search-options.label.view" />
                              {` ${index + 1}: `}
                            </span>
                            <span>
                              <a href={`/screenshot-library/?view=${viewObject._id}`}>{`${viewObject._id}`}</a>
                            </span>
                            <span>{` (Total: ${viewObject.count})`}</span>
                          </div>
                          <div className="screenshot-card-library">
                            {
                              viewObject.platforms && viewObject.platforms.length > 0 ? (
                                <ScreenshotCard
                                  screenshot={viewObject.platforms[0].screenshot}
                                  isBaseline={false}
                                  isSelectedId={false}
                                />
                              ) : null
                            }
                          </div>
                        </Container>
                      ))
                    ) : null
                  }
                </div>
              </Col>
              <Col xs={12}>
                <div>
                  {
                    screenshotMetrics.tags ? (
                      screenshotMetrics.tags.map((tagObject, index) => (
                        <Container className="card-deck-history">
                          <div>
                            <span>
                              <FormattedMessage id="page.screenshot-library.search-options.label.tag" />
                              {` ${index + 1}: `}
                            </span>
                            <span>
                              <a href={`/screenshot-library/?tag=${tagObject._id}`}>{`${tagObject._id}`}</a>
                            </span>
                            <span>{` (Total: ${tagObject.count})`}</span>
                          </div>
                          <div className="screenshot-card-library">
                            {
                              tagObject.platforms && tagObject.platforms.length > 0 ? (
                                <ScreenshotCard
                                  screenshot={tagObject.platforms[0].screenshot}
                                  isBaseline={false}
                                  isSelectedId={false}
                                />
                              ) : null
                            }
                          </div>
                        </Container>
                      ))
                    ) : null
                  }
                </div>
              </Col>
            </Row>
          </Panel>
        ) : null
      }
    </div>
  );
};

export default ScreenshotLibraryPage;
