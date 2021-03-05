import React, { Component } from 'react';
import Moment from 'react-moment';
import axios from 'axios';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import Table from 'react-bootstrap/Table';
import Alert from 'react-bootstrap/Alert';
import CardDeck from 'react-bootstrap/CardDeck';
import Card from 'react-bootstrap/Card';
import { withRouter } from 'react-router-dom';
import { encode as btoa } from 'base-64';
import ImageCarousel from '../elements/ImageCarousel';
import ScreenshotDetailsTable from '../tables/ScreenshotDetailsTable';
import 'react-multi-carousel/lib/styles.css';
import './Default.css';

class ScreenshotView extends Component {
  constructor(props) {
    super(props);
    const { buildScreenshots } = this.props;
    this.state = {
      buildScreenshots,
      currentScreenshot: null,
      currentBaseline: null,
    };
  }

  componentDidMount() {
    const { selectedScreenshotId, selectedTab } = this.props;
    this.loadScreenshot(selectedScreenshotId);
    if (selectedTab) {
      this.handleSelect(selectedTab);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { currentBaseLineDetails, currentScreenshotDetails } = this.state;
    if (prevState.currentBaseLineDetails !== currentBaseLineDetails) {
      // if base line details have changed, load the new image
      if (currentBaseLineDetails && currentBaseLineDetails.screenshot) {
        this.getBaselineCompare(currentScreenshotDetails._id, true);
      } else {
        this.setState({ currentBaselineCompare: undefined });
      }
    }
  }

  handleSelect(value) {
    if (['image', 'history', 'baseline', 'sidebyside'].includes(value)) this.setState({ key: value });
  }

  getScreenshotDetails = (screenshotId) => axios.get(`/screenshot/${screenshotId}`)
    .then((res) => {
      this.setState({ currentScreenshotDetails: res.data });
      const { currentScreenshotDetails } = this.state;
      if (currentScreenshotDetails != null && (currentScreenshotDetails.view !== null && currentScreenshotDetails.view !== '')) {
        // if there is a view, retrieve the history
        this.getScreenshotHistoryByView(currentScreenshotDetails.view,
          currentScreenshotDetails.platformId, 10);
        if (currentScreenshotDetails.platform) {
          this.getBaseLineDetails(currentScreenshotDetails);
        }
      } else if (currentScreenshotDetails != null) {
        this.handleSelect('image');
      }
    })

  getScreenshotHistoryByView = (view, platformId, limit, offset) => axios.get('/screenshot/', {
    params: {
      view,
      platformId,
      limit,
      offset,
    },
  })
    .then((res) => {
      this.setState({ currentScreenshotHistory: res.data });
    })

  getScreenshot = (screenshotId) => axios.get(`/screenshot/${screenshotId}/image`, { responseType: 'arraybuffer' })
    .then((res) => {
      const base64 = btoa(
        new Uint8Array(res.data).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          '',
        ),
      );
      this.setState({ currentScreenshot: `data:;base64,${base64}` });
    }).catch(() => {
      // failed to retrieve baseline.
      this.setState({ currentScreenshot: 'ERROR' });
    })

  getBaselineScreenshot = (screenshotId) => axios.get(`/screenshot/${screenshotId}/image`, { responseType: 'arraybuffer' })
    .then((res) => {
      const base64 = btoa(
        new Uint8Array(res.data).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          '',
        ),
      );
      this.setState({ currentBaseline: `data:;base64,${base64}` });
    }).catch(() => {
      // failed to retrieve baseline.
      this.setState({ currentBaseline: 'ERROR' });
    })

  getBaselineCompare = (screenshotId, useCache) => axios.get(`/screenshot/${screenshotId}/baseline/compare/image/?useCache=${useCache}`, { responseType: 'arraybuffer' })
    .then((res) => {
      const base64 = btoa(
        new Uint8Array(res.data).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          '',
        ),
      );
      this.setState({ currentBaselineCompare: `data:;base64,${base64}` });
    })
    .catch(() => {
      // failed to retrieve baseline.
      this.setState({ currentBaselineCompare: 'ERROR' });
    })

  getBaseLineDetails = (screenshot) => {
    let baselineQuery = `/baseline/?view=${screenshot.view}&platformName=${screenshot.platform.platformName}`;
    if (screenshot.platform.deviceName) {
      baselineQuery = `${baselineQuery}&deviceName=${screenshot.platform.deviceName}`;
    } else {
      baselineQuery = `${baselineQuery}&browserName=${screenshot.platform.browserName}&screenHeight=${screenshot.height}&screenWidth=${screenshot.width}`;
    }
    axios.get(baselineQuery)
      .then((res) => {
        const baseline = res.data[0];
        // to handle better in the future
        this.setState({ currentBaseLineDetails: baseline });
        if (baseline && baseline.screenshot._id) {
          this.getBaselineScreenshot(baseline.screenshot._id);
        }
      });
  }

  updateBaseline = (screenshot) => {
    const { currentBaseLineDetails } = this.state;
    if (currentBaseLineDetails) {
      // if there is already a base line we need to update it.
      this.updateBaselineForView(currentBaseLineDetails._id, screenshot._id);
    } else {
      // create a new baseline
      this.setBaselineForView(screenshot);
    }
  }

  setBaselineForView = (screenshot) => axios.post('/baseline/', {
    view: screenshot.view,
    screenshotId: screenshot._id,
  })
    .then((res) => {
      this.setState({ currentBaseLineDetails: res.data });
    })

  forceBaselineCompare = (screenshotId) => this.getBaselineCompare(screenshotId, false);

  updateBaselineForView = (baselineId, screenshotId) => axios.put(`/baseline/${baselineId}`, {
    screenshotId,
  })
    .then((res) => {
      this.setState({ currentBaseLineDetails: res.data });
    })

  isBaseline = (screenshotId) => {
    const { currentBaseLineDetails } = this.state;
    return (currentBaseLineDetails && currentBaseLineDetails.screenshot
      && currentBaseLineDetails.screenshot._id === screenshotId);
  }

  setTab = (key) => {
    this.handleSelect(key);
  }

  loadScreenshot = (screenshotId) => {
    const { currentScreenshotDetails } = this.state;
    if (currentScreenshotDetails === undefined || currentScreenshotDetails._id !== screenshotId) {
      this.setState({
        currentScreenshot: undefined,
        currentBaseline: undefined,
        currentScreenshotHistory: undefined,
        currentBaselineCompare: undefined,
      });
      this.getScreenshotDetails(screenshotId);
      this.getScreenshot(screenshotId);
    }
  }

  isSelectedId = (screenshotId) => {
    const { currentScreenshotDetails } = this.state;
    if (currentScreenshotDetails && currentScreenshotDetails._id === screenshotId) {
      return true;
    }
    return false;
  }

  displayScreenshot = (currentScreenshot) => {
    if (!currentScreenshot) {
      return (
        <div className="alert alert-danger" role="alert">
          <span>
            Unable to retrieve image. Please refresh the page and try again.
          </span>
        </div>
      );
    }
    if (currentScreenshot === 'ERROR') {
      return (
        <div className="alert alert-primary" role="alert">
          <span>
            <i className="fas fa-spinner fa-pulse fa-2x" />
            Retrieving screenshot.
          </span>
        </div>
      );
    }
    return <img className="screenshot" src={currentScreenshot} alt="Screenshot" />;
  }

  displayBaselineImage = (currentBaseLineDetails, currentBaselineCompare) => {
    if (!currentBaseLineDetails) {
      return 'No Baseline selected yet for this view and deviceName or browser combination. To select a baseline, navigate to the image you want as a baseline and click on the "Make Baseline Image" button';
    }
    if (!currentBaselineCompare) {
      return (
        <div className="alert alert-primary" role="alert">
          <span>
            <i className="fas fa-spinner fa-pulse fa-2x" />
            Loading baseline compare.
          </span>
        </div>
      );
    }
    if (currentBaselineCompare === 'ERROR') {
      return (
        <div className="alert alert-danger" role="alert">
          <span>Failed to retrieve basedline compare.</span>
        </div>
      );
    }
    return <img className="screenshot" src={currentBaselineCompare} alt="Compare" />;
  }

  displaySideBySideBaseline = (currentBaseline) => {
    if (!currentBaseline) {
      return (
        <div className="alert alert-primary" role="alert">
          <span>
            <i className="fas fa-spinner fa-pulse fa-2x" />
            <span> Retrieving baseline screenshot.</span>
          </span>
        </div>
      );
    }
    if (currentBaseline === 'ERROR') {
      return (
        <div className="alert alert-danger" role="alert">
          <span>
            Unable to retrieve baseline image.
            Please refresh the page and try again.
          </span>
        </div>
      );
    }
    return <img className="screenshot" src={currentBaseline} alt="Baseline Screenshot" />;
  }

  displaySideBySideScreenshot = (currentScreenshot) => {
    if (!currentScreenshot) {
      return (
        <div className="alert alert-primary" role="alert">
          <span>
            <i className="fas fa-spinner fa-pulse fa-2x" />
            <span> Retrieving screenshot.</span>
          </span>
        </div>
      );
    }
    if (currentScreenshot === 'ERROR') {
      return (
        <div className="alert alert-danger" role="alert">
          <span>
            Unable to retrieve image. Please refresh the page and try again.
          </span>
        </div>
      );
    }
    return <img className="screenshot" src={currentScreenshot} alt="Screenshot" />;
  }

  returnMakeBaselineButton = (currentScreenshotDetails) => {
    if (currentScreenshotDetails.platform && currentScreenshotDetails.view) {
      return (
        <button
          onClick={() => this.updateBaseline(currentScreenshotDetails)}
          disabled={this.isBaseline(currentScreenshotDetails._id)}
          type="button"
          className="btn btn-outline-primary"
        >
          { !this.isBaseline(currentScreenshotDetails._id) ? ('Make Baseline Image') : 'This is the Baseline Image'}
        </button>
      );
    }
    return null;
  }

  render() {
    const {
      buildScreenshots,
      currentScreenshotDetails,
      currentScreenshotHistory,
      currentScreenshot,
      key,
      currentBaseLineDetails,
      currentBaseline,
      currentBaselineCompare,
    } = this.state;
    if (!buildScreenshots || !currentScreenshotDetails) {
      return (
        <div className="alert alert-primary" role="alert">
          <span>
            <i className="fas fa-spinner fa-pulse fa-2x" />
            <span> Retrieving screenshot details.</span>
          </span>
        </div>
      );
    }
    return (
      <div>
        <ImageCarousel
          screenshots={buildScreenshots}
          selectedScreenshotDetails={currentScreenshotDetails}
          loadScreenshot={this.loadScreenshot}
        />
        {
          !currentScreenshotDetails.platform || !currentScreenshotDetails.view
            ? <Alert variant="info">To enable the &quot;History&quot; and &quot;Compare with Baseline&quot; tabs please provide a view and platform details when uploading the screenshots to angles.</Alert>
            : null
        }
        <Tabs id="image-tabs" activeKey={key} defaultActiveKey="image" onSelect={(tabKey, evt) => this.setTab(tabKey, evt)}>
          <Tab eventKey="image" title="Image">
            <div className="image-page-holder">
              <Table>
                <tbody>
                  <tr>
                    <td className="screenshot-details-td">
                      <div>
                        <ScreenshotDetailsTable
                          currentScreenshotDetails={currentScreenshotDetails}
                          isBaseline={this.isBaseline(currentScreenshotDetails._id)}
                        />
                      </div>
                    </td>
                    <td>
                      {
                        this.displayScreenshot(currentScreenshot)
                      }
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="100%">
                      <span style={{ float: 'left' }}>
                        {
                          this.returnMakeBaselineButton(currentScreenshotDetails)
                        }
                      </span>
                    </td>
                  </tr>
                </tbody>
              </Table>
            </div>
          </Tab>
          <Tab eventKey="history" disabled={!currentScreenshotDetails.platform || !currentScreenshotDetails.view} title="History">
            <div className="image-page-holder">
              { currentScreenshotHistory != null ? (
                <CardDeck className="card-deck-history">
                  {currentScreenshotHistory.map((screenshot) => [
                    <Card key={screenshot._id} className={`screenshotCard ${this.isSelectedId(screenshot._id) ? 'card-active' : ''}`}>
                      { this.isBaseline(screenshot._id) ? (<div className="card-img-overlay baseline-overlay"><p>baseline</p></div>) : null }
                      { !this.isSelectedId(screenshot._id) ? (
                        <a title="Go to screenshot" href={`/build?buildId=${screenshot.build}&loadScreenshotId=${screenshot._id}`}>
                          <Card.Img variant="top" src={`data:image/png;base64, ${screenshot.thumbnail}`} />
                        </a>
                      ) : <Card.Img variant="top" src={`data:image/png;base64, ${screenshot.thumbnail}`} /> }
                      <Card.Body>
                        <Card.Footer>
                          <div>
                            <Table className="table-screenshot-history-details" bordered size="sm">
                              <tbody>
                                <tr>
                                  <td>
                                    <strong>View: </strong>
                                    <span>{` ${screenshot.view}`}</span>
                                  </td>
                                </tr>
                                <tr>
                                  <td>
                                    <strong>Date: </strong>
                                    <Moment format="DD-MM-YYYY HH:mm:ss">
                                      {screenshot.timestamp}
                                    </Moment>
                                  </td>
                                </tr>
                                <tr>
                                  <td>
                                    <strong>Resolution: </strong>
                                    <span>{`${screenshot.width} x ${screenshot.height}`}</span>
                                  </td>
                                </tr>
                                <tr>
                                  <td>
                                    <strong>Platform: </strong>
                                    { screenshot.platform ? (screenshot.platform.platformName) : '' }
                                    { screenshot.platform && screenshot.platform.platformVersion ? (screenshot.platform.platformVersion) : '' }
                                    { screenshot.platform && screenshot.platform.browserName ? (` (${screenshot.platform.browserName}${screenshot.platform.browserVersion ? (` ${screenshot.platform.browserVersion}`) : ''})`) : '' }
                                  </td>
                                </tr>
                                {
                                  screenshot.platform && screenshot.platform.deviceName ? (
                                    <tr>
                                      <td>
                                        <strong>Device: </strong>
                                        {` ${screenshot.platform.deviceName} `}
                                      </td>
                                    </tr>
                                  ) : null
                                }
                              </tbody>
                            </Table>
                          </div>
                        </Card.Footer>
                      </Card.Body>
                    </Card>,
                  ])}
                </CardDeck>
              ) : (
                <div className="alert alert-primary" role="alert">
                  <span>
                    <i className="fas fa-spinner fa-pulse fa-2x" />
                    <span> Loading history.</span>
                  </span>
                </div>
              )}
            </div>
          </Tab>
          <Tab eventKey="baseline" title="Overlay with Baseline" disabled={!currentScreenshotDetails.platform || !currentScreenshotDetails.view}>
            <div className="image-page-holder">
              {
                  this.displayBaselineImage(currentBaseLineDetails, currentBaselineCompare)
              }
            </div>
          </Tab>
          <Tab eventKey="sidebyside" title="Side by Side with Baseline" disabled={!currentScreenshotDetails.platform || !currentScreenshotDetails.view}>
            <div className="image-page-holder">
              <Table>
                <tbody>
                  <tr>
                    <td colSpan="100%" className="sbs-header">
                      Original Image
                    </td>
                  </tr>
                  <tr>
                    <td className="screenshot-details-td">
                      <div>
                        <ScreenshotDetailsTable
                          currentScreenshotDetails={currentScreenshotDetails}
                          isBaseline={this.isBaseline(currentScreenshotDetails._id)}
                        />
                      </div>
                    </td>
                    <td>
                      {
                        this.displaySideBySideScreenshot(currentScreenshot)
                      }
                    </td>
                  </tr>
                  {
                    currentBaseLineDetails ? ([
                      <tr key="title" className="sbs-header">
                        <td colSpan="100%">
                          Baseline
                        </td>
                      </tr>,
                      <tr key="baseline-image">
                        <td className="screenshot-details-td">
                          <div>
                            <ScreenshotDetailsTable
                              currentScreenshotDetails={currentBaseLineDetails.screenshot}
                              isBaseline={this.isBaseline(currentScreenshotDetails._id)}
                            />
                          </div>
                        </td>
                        <td>
                          {
                            this.displaySideBySideBaseline(currentBaseline)
                          }
                        </td>
                      </tr>,
                    ]) : null
                  }
                </tbody>
              </Table>
            </div>
          </Tab>
        </Tabs>
      </div>
    );
  }
}

export default withRouter(ScreenshotView);
