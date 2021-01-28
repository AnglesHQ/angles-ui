import React, { Component } from 'react'
import Moment from 'react-moment';
import axios from 'axios';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import Table from 'react-bootstrap/Table';
import Alert from 'react-bootstrap/Alert';
import CardDeck from 'react-bootstrap/CardDeck';
import Card from 'react-bootstrap/Card';
import ImageCarousel from '../elements/ImageCarousel';
import ScreenshotDetailsTable from '../tables/ScreenshotDetailsTable';
import 'react-multi-carousel/lib/styles.css';
import './Default.css'
import { withRouter} from 'react-router-dom';

class ScreenshotView extends Component {

  constructor(props) {
    super(props);
    this.state = {
      buildScreenshots: this.props.buildScreenshots
    };
    this.loadScreenshot(this.props.selectedScreenshotId)
  }

  getScreenshotDetails = (screenshotId) => {
    return axios.get('/screenshot/' + screenshotId)
    .then((res) => {
      this.setState({ currentScreenshotDetails: res.data })
      if (this.state.currentScreenshotDetails != null && this.state.currentScreenshotDetails.view != null) {
        // if there is a view, retrieve the history
        this.getScreenshotHistoryByView(this.state.currentScreenshotDetails.view, this.state.currentScreenshotDetails.platformId, 10);
        if (this.state.currentScreenshotDetails.platform)
          this.getBaseLineDetails(this.state.currentScreenshotDetails);
      }
    })
  }

  getScreenshotHistoryByView = (view, platformId, limit, offset) => {
    return axios.get('/screenshot/', {
      params: {
        view,
        platformId,
        limit,
        offset
      }
    })
    .then((res) => {
      this.setState({ currentScreenshotHistory: res.data });
    })

  }

  getScreenshot = (screenshotId) => {
    return axios.get('/screenshot/' + screenshotId + "/image", { responseType: 'arraybuffer' })
    .then((res) => {
      const base64 = btoa(
       new Uint8Array(res.data).reduce(
         (data, byte) => data + String.fromCharCode(byte),
         '',
       ),
     );
      this.setState({ currentScreenshot: "data:;base64," + base64 });
    })
  }

  getScreenshotCompare = (screenshotId, baselineId) => {
    return axios.get('/screenshot/' + screenshotId + "/compare/" + baselineId + "/image", { responseType: 'arraybuffer' })
    .then((res) => {
      const base64 = btoa(
       new Uint8Array(res.data).reduce(
         (data, byte) => data + String.fromCharCode(byte),
         '',
       ),
     );
      this.setState({ currentBaselineCompare: "data:;base64," + base64 });
    })
    .catch((err) => {
      // failed to retrieve baseline.
      this.setState({ currentBaselineCompare: "ERROR" });
    })
  }

  getBaseLineDetails = (screenshot) => {
    let baselineQuery =  `/baseline/?view=${screenshot.view}&platformName=${screenshot.platform.platformName}`;
    if (screenshot.platform.deviceName) {
      baselineQuery = `${baselineQuery}&deviceName=${screenshot.platform.deviceName}`;
    } else {
      baselineQuery = `${baselineQuery}&browserName=${screenshot.platform.browserName}&screenHeight=${screenshot.height}&screenWidth=${screenshot.width}`;
    }
    axios.get(baselineQuery)
        .then((res) => {
          // to handle better in the future
          this.setState({ currentBaseLineDetails: res.data[0] });
        })
  }

  updateBaseline(screenshot) {
    if (this.state.currentBaseLineDetails) {
     //if there is already a base line we need to update it.
      this.updateBaselineForView(this.state.currentBaseLineDetails._id, screenshot._id);
    } else {
      //create a new baseline
      this.setBaselineForView(screenshot);
    }
  }

  setBaselineForView(screenshot) {
    return axios.post('/baseline/', {
      view: screenshot.view,
      screenshotId: screenshot._id
    })
    .then((res) => {
      this.setState({ currentBaseLineDetails: res.data })
    })
  }

  updateBaselineForView(baselineId, screenshotId) {
    return axios.put(`/baseline/${baselineId}`, {
      screenshotId
    })
    .then((res) => {
      this.setState({ currentBaseLineDetails: res.data })
    })
  }

  isBaseline(screenshotId) {
    return (this.state.currentBaseLineDetails && this.state.currentBaseLineDetails.screenshot && this.state.currentBaseLineDetails.screenshot._id === screenshotId)
  }

  setTab = (key, evt) => {
    if (key === "baseline") {
    }
  }

  loadScreenshot = (screenshotId) => {
    this.getScreenshotDetails(screenshotId);
    this.getScreenshot(screenshotId);
  }

  isSelectedId = (screenshotId) => {
    if (this.state.currentScreenshotDetails && this.state.currentScreenshotDetails._id === screenshotId) {
      return true;
    } else {
      return false;
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevState.currentBaseLineDetails !== this.state.currentBaseLineDetails) {
      //if base line details have changed, load the new image
      if (this.state.currentBaseLineDetails && this.state.currentBaseLineDetails.screenshot) {
        this.getScreenshotCompare(this.state.currentScreenshotDetails._id, this.state.currentBaseLineDetails.screenshot._id);
      } else {
        this.setState({currentBaselineCompare: undefined});
      }
    }
  }

  render() {
    if (!this.state.currentScreenshotDetails) {
      return <div className="alert alert-primary" role="alert">
        <span><i className="fas fa-spinner fa-pulse fa-2x"></i> Retrieving screenshot details.</span>
      </div>
    }
    return (
      <div >
        <ImageCarousel
          screenshots={this.state.buildScreenshots}
          selectedScreenshotDetails={this.state.currentScreenshotDetails}
          loadScreenshot={this.loadScreenshot}
        />
        {
          !this.state.currentScreenshotDetails.platform || !this.state.currentScreenshotDetails.view ?
          <Alert variant="info">To enable the "History" and "Compare with Baseline" tabs please provide a view and platform details when uploading the screenshots to angles.</Alert> :
            null
        }
        <Tabs id="image-tabs" defaultActiveKey="image" onSelect={(key, evt) => this.setTab(key, evt)} >
            <Tab eventKey="image" title="Image">
              <div className="image-page-holder">
                <Table>
                  <tbody>
                    <tr>
                      <td className={"screenshot-details-td"}>
                      <div>
                        <ScreenshotDetailsTable currentScreenshotDetails={this.state.currentScreenshotDetails } isBaseline={ this.isBaseline(this.state.currentScreenshotDetails._id)} />
                      </div>
                      </td>
                      <td>
                        { this.state.currentScreenshot ? ( <img className="screenshot" src={this.state.currentScreenshot} alt="Screenshot" /> ) : null }
                      </td>
                    </tr>
                    <tr>
                      <td colSpan="100%">
                        <span style={{ float: "left" }}>
                          {
                            this.state.currentScreenshotDetails.platform ?
                              <button onClick={() => this.updateBaseline(this.state.currentScreenshotDetails) } disabled={ this.isBaseline(this.state.currentScreenshotDetails._id) } type="button" className="btn btn-outline-primary">{ !this.isBaseline(this.state.currentScreenshotDetails._id) ? ("Make Baseline Image"): "This is the Baseline Image"}</button> :
                              null
                          }

                        </span>
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </div>
            </Tab>
            <Tab eventKey="history" disabled={ !this.state.currentScreenshotDetails.platform || !this.state.currentScreenshotDetails.view } title="History">
              <div className="image-page-holder">
                <CardDeck className="card-deck-history">
                  { this.state.currentScreenshotHistory != null ? (
                    this.state.currentScreenshotHistory.map((screenshot, index) => {
                      return [
                          <Card key={index} className={`screenshotCard ${ this.isSelectedId(screenshot._id) ? "card-active" : ""}`}>
                            { this.isBaseline(screenshot._id) ? (<div className="card-img-overlay baseline-overlay"><p>baseline</p></div>) : null }
                            <Card.Img variant="top" src={"data:image/png;base64, " + screenshot.thumbnail} />
                            <Card.Body>
                              <Card.Footer>
                              <div>
                                <Table className="table-screenshot-history-details" bordered size="sm">
                                  <tbody>
                                    <tr>
                                      <td><strong>View: </strong> {screenshot.view}</td>
                                    </tr>
                                    <tr>
                                      <td><strong>Date: </strong>
                                        <Moment format="DD-MM-YYYY HH:mm:ss">
                                          {screenshot.timestamp}
                                        </Moment>
                                        { !this.isSelectedId(screenshot._id) ? (
                                          <span> (<a title={`Go to screenshot`} href={`/build?buildId=${screenshot.build}&loadScreenshotId=${screenshot._id}`}>navigate to screenshot</a>)</span>
                                        ): null }
                                      </td>
                                    </tr>
                                    <tr>
                                      <td><strong>Resolution: </strong>{screenshot.width} x {screenshot.height}</td>
                                    </tr>
                                    <tr>
                                      <td><strong>Platform: </strong>{ screenshot.platform ? (screenshot.platform.platformName) : "" } { screenshot.platform && screenshot.platform.platformVersion ? (screenshot.platform.platformVersion) : "" } { screenshot.platform && screenshot.platform.browserName ? ( ` (${screenshot.platform.browserName}${ screenshot.platform.browserVersion ? (" " + screenshot.platform.browserVersion) : "" })` ) : "" }</td>
                                    </tr>
                                    {
                                      screenshot.platform && screenshot.platform.deviceName ? (
                                        <tr>
                                          <td><strong>Device: </strong>{ screenshot.platform.deviceName }</td>
                                        </tr>
                                      ) : null
                                    }
                                  </tbody>
                                </Table>
                              </div>
                              </Card.Footer>
                            </Card.Body>
                          </Card>
                      ]
                    })
                  ) : "N/A" }
                </CardDeck>
              </div>
            </Tab>
            <Tab eventKey="baseline" title="Compare with Baseline" disabled={ !this.state.currentScreenshotDetails.platform || !this.state.currentScreenshotDetails.view }>
              <div className="image-page-holder">
              { this.state.currentBaseLineDetails ? (
                  this.isBaseline(this.state.currentScreenshotDetails._id) ?
                    "The current image is the baseline"
                  : this.state.currentBaselineCompare ? (
                    this.state.currentBaselineCompare !== "ERROR" ? (
                      <img className="screenshot" src={this.state.currentBaselineCompare} alt="Compare" />
                    ): "Failed to retrieve basedline compare."
                  ) : "Attempting to load base line compare."
                )
              : "No Baseline selected yet for this view and deviceName or browser combination. To select a baseline, navigate to the image you want as a baseline and click on the \"Make Baseline Image\" button"
              }
              </div>
            </Tab>
        </Tabs>
      </div>
    );
  }
}

export default withRouter(ScreenshotView);
