import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import queryString from 'query-string';
import { ScreenshotRequests } from 'angles-javascript-client';
import 'react-multi-carousel/lib/styles.css';
import './Default.css';
import ScreenshotView from './ScreenshotView';

const ScreenshotLibraryPage = function () {
  const location = useLocation();
  const query = queryString.parse(location.search);
  const [groupedScreenshots, setGroupedScreenshots] = useState(null);
  const [filteredScreenshots, setFilteredScreenshots] = useState(null);
  const [retrievingScreenshots, setRetrievingScreenshots] = useState(false);
  const [platforms, setPlatforms] = useState(null);
  const [groupType, setGroupType] = useState(null);
  // const [selectedScreenshot, setSelectedScreenshot] = useState(null);
  // const [currentScreenshotDetails, setCurrentScreenshotDetails] = useState(null);
  const [selectedTab] = useState(query.selectedTab || 'image');
  const [view, setView] = useState('');
  const [tag, setTag] = useState('');
  const [numberOfDays, setNumberOfDays] = useState(14);
  const screenshotRequests = new ScreenshotRequests(axios);

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
    setView(event.target.value);
    setTag('');
  };

  const handleTagChange = (event) => {
    setTag(event.target.value);
    setView('');
  };

  const handleNumberOfDaysChange = (event) => {
    setNumberOfDays(event.target.value);
  };

  const submitScreenshotSearch = (event) => {
    event.preventDefault();
    setFilteredScreenshots(null);
    if (view !== '') {
      getGroupedScreenshotByPlatform(view, numberOfDays);
    } else if (tag !== '') {
      getGroupedScreenshotByTag(tag, numberOfDays);
    }
  };

  const filterByPlatform = (event) => {
    const filteredScreenshotsToStore = groupedScreenshots
      .filter((screenshot) => screenshot.platformId === event.target.value);
    setFilteredScreenshots(filteredScreenshotsToStore);
  };

  return (
    <div>
      <h1>Screenshot Library</h1>
      <div className="screenshot-form-container">
        <Form onSubmit={submitScreenshotSearch}>
          <Form.Row>
            <Form.Group as={Col} className="tag-form-group">
              <Form.Label htmlFor="viewInput"><b>View</b></Form.Label>
              <Form.Control type="text" id="viewInput" value={view} onChange={handleViewChange} />
              <Form.Text id="viewInput" muted>
                Please fill in the view OR the tag input and click submit.
              </Form.Text>
            </Form.Group>
            <div className="screenshot-finder-form-or-div">OR</div>
            <Form.Group as={Col}>
              <Form.Label htmlFor="tagInput"><b>Tag</b></Form.Label>
              <Form.Control type="text" id="tagInput" value={tag} onChange={handleTagChange} />
            </Form.Group>
          </Form.Row>
          <Form.Row>
            <Form.Group as={Col}>
              <Form.Label htmlFor="numberOfDays"><b>Number of days</b></Form.Label>
              <Form.Control id="numberOfDays" as="select" value={numberOfDays} onChange={handleNumberOfDaysChange}>
                <option key="1" value="1">1 Day</option>
                <option key="2" value="7">1 Week</option>
                <option key="3" value="14">2 Weeks</option>
                <option key="4" value="31">1 Month</option>
                <option key="5" value="90">3 Months</option>
                <option key="6" value="180">6 Months</option>
              </Form.Control>
              <Button disabled={view === '' && tag === ''} variant="primary" type="submit" className="search-button">Search Screenshots</Button>
            </Form.Group>
            <Form.Group as={Col} className="tag-form-group tag-form-group-platform">
              {
                  groupType === 'tag' && platforms && platforms.length > 0 ? (
                    <div>
                      <Form.Label htmlFor="platformSelect"><b>{ `Platform (${platforms.length})`}</b></Form.Label>
                      <Form.Control id="platformSelect" as="select" onChange={filterByPlatform}>
                        {
                         platforms.map((platform) => <option key={platform}>{platform}</option>)
                       }
                      </Form.Control>
                    </div>
                  ) : null
              }
            </Form.Group>
          </Form.Row>
        </Form>
      </div>
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
            && (filteredScreenshots === undefined || filteredScreenshots.length === 0) ? (
              <div className="alert alert-primary" role="alert">
                <span>
                  <span>No images to display.</span>
                </span>
              </div>
            ) : null
        }
        {
          retrievingScreenshots === false && filteredScreenshots
            && filteredScreenshots.length > 0 ? (
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
