import React, { Component } from 'react';
import axios from 'axios';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import queryString from 'query-string';
import { withRouter } from 'react-router-dom';
import { ScreenshotRequests } from 'angles-javascript-client';
import 'react-multi-carousel/lib/styles.css';
import './Default.css';
import ScreenshotView from './ScreenshotView';

class ScreenshotFinderPage extends Component {
  constructor(props) {
    super(props);
    const { location } = this.props;
    const query = queryString.parse(location.search);
    this.state = {
      groupedScreenshots: undefined,
      filteredScreenshots: undefined,
      retrievingScreenshots: false,
      platforms: undefined,
      groupType: undefined,
      // selectedScreenshot: undefined,
      // currentScreenshotDetails: undefined,
      selectedTab: query.selectedTabe || 'image',
      view: '',
      tag: '',
      numberOfDays: 14,
    };
    const { numberOfDays } = this.state;
    this.screenshotRequests = new ScreenshotRequests(axios);
    if (query.view) {
      this.getGroupedScreenshotByPlatform(query.view,
        query.numberOfDays ? (query.numberOfDays) : numberOfDays);
    } else if (query.tag) {
      this.getGroupedScreenshotByTag(query.tag,
        query.numberOfDays ? (query.numberOfDays) : numberOfDays);
    }
  }

  getGroupedScreenshotByPlatform = (view, numberOfDays) => {
    this.setState({ retrievingScreenshots: true, filteredScreenshots: undefined });
    this.screenshotRequests
      .getScreenshotsGroupedByPlatform(view, numberOfDays)
      .then((groupedScreenshots) => {
        this.setState({
          view,
          numberOfDays,
          groupType: 'view',
          groupedScreenshots,
          filteredScreenshots: groupedScreenshots,
          retrievingScreenshots: false,
        });
      })
      .catch(() => {
        this.setState({ retrievingScreenshots: false });
      });
  }

  getGroupedScreenshotByTag = (tag, numberOfDays) => {
    this.setState({ retrievingScreenshots: true, filteredScreenshots: undefined });
    this.screenshotRequests.getScreenshotsGroupedByTag(tag, numberOfDays)
      .then((groupedScreenshots) => {
        const uniquePlatforms = [];
        groupedScreenshots.forEach((screenshot) => {
          if (!uniquePlatforms.includes(screenshot.platformId)) {
            uniquePlatforms.push(screenshot.platformId);
          }
        });
        uniquePlatforms.sort();
        const filteredScreenshots = groupedScreenshots
          .filter((screenshot) => screenshot.platformId === uniquePlatforms[0]);
        this.setState({
          tag,
          numberOfDays,
          groupType: 'tag',
          groupedScreenshots,
          filteredScreenshots,
          retrievingScreenshots: false,
          platforms: uniquePlatforms,
        });
      })
      .catch(() => {
        this.setState({ retrievingScreenshots: false });
      });
  }

  handleViewChange = (event) => {
    this.setState({ view: event.target.value, tag: '' });
  }

  handleTagChange = (event) => {
    this.setState({ tag: event.target.value, view: '' });
  }

  handleNumberOfDaysChange = (event) => {
    this.setState({ numberOfDays: event.target.value });
  }

  submitScreenshotSearch = (event) => {
    const { view, tag, numberOfDays } = this.state;
    event.preventDefault();
    this.setState({ filteredScreenshots: undefined });
    if (view !== '') {
      this.getGroupedScreenshotByPlatform(view, numberOfDays);
    } else if (tag !== '') {
      this.getGroupedScreenshotByTag(tag, numberOfDays);
    }
  }

  filterByPlatform = (event) => {
    const { groupedScreenshots } = this.state;
    const filteredScreenshots = groupedScreenshots
      .filter((screenshot) => screenshot.platformId === event.target.value);
    this.setState({ filteredScreenshots });
  }

  render() {
    const {
      view,
      tag,
      numberOfDays,
      groupType,
      platforms,
      filteredScreenshots,
      retrievingScreenshots,
      selectedTab,
    } = this.state;
    return (
      <div>
        <h1>Screenshot finder</h1>
        <div className="screenshot-form-container">
          <Form onSubmit={this.submitScreenshotSearch}>
            <Form.Row>
              <Form.Group as={Col} className="tag-form-group">
                <Form.Label htmlFor="viewInput"><b>View</b></Form.Label>
                <Form.Control type="text" id="viewInput" value={view} onChange={this.handleViewChange} />
                <Form.Text id="viewInput" muted>
                  Please fill in the view OR the tag input and click submit.
                </Form.Text>
              </Form.Group>
              <div className="screenshot-finder-form-or-div">OR</div>
              <Form.Group as={Col}>
                <Form.Label htmlFor="tagInput"><b>Tag</b></Form.Label>
                <Form.Control type="text" id="tagInput" value={tag} onChange={this.handleTagChange} />
              </Form.Group>
            </Form.Row>
            <Form.Row>
              <Form.Group as={Col}>
                <Form.Label htmlFor="numberOfDays"><b>Number of days</b></Form.Label>
                <Form.Control id="numberOfDays" as="select" value={numberOfDays} onChange={this.handleNumberOfDaysChange}>
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
                        <Form.Control id="platformSelect" as="select" onChange={this.filterByPlatform}>
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
  }
}

export default withRouter(ScreenshotFinderPage);
