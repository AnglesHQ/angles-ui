import React, { Component } from 'react'
import Moment from 'react-moment';
import axios from 'axios';
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'
import Table from 'react-bootstrap/Table'
import CardDeck from 'react-bootstrap/CardDeck'
import Card from 'react-bootstrap/Card'
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import './Default.css'

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
        this.getScreenshotHistoryByView(this.state.currentScreenshotDetails.view, 10);
        this.getBaseLineDetails(this.state.currentScreenshotDetails);
      }
    })
  }

  getScreenshotHistoryByView = (view, limit, offset) => {
    return axios.get('/screenshot/', {
      params: {
        view,
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

  setTab = (key) => {
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

    const responsive = {
      desktopxxl: {
        breakpoint: { max: 5000, min: 2500 },
        items: 6,
        slidesToSlide: 2 // optional, default to 1.
      },
      desktopxl: {
        breakpoint: { max: 2500, min: 1400 },
        items: 5,
        slidesToSlide: 2 // optional, default to 1.
      },
      desktop: {
        breakpoint: { max: 1400, min: 1024 },
        items: 4,
        slidesToSlide: 2 // optional, default to 1.
      },
      tablet: {
        breakpoint: { max: 1024, min: 464 },
        items: 3,
        slidesToSlide: 1 // optional, default to 1.
      },
      mobile: {
        breakpoint: { max: 464, min: 0 },
        items: 3,
        slidesToSlide: 1 // optional, default to 1.
      }
    };


    if (!this.state.currentScreenshotDetails) {
      return <div><span>no details</span></div>;
    }
    return (
      <div >
        <Carousel
          swipeable={false}
          draggable={false}
          showDots={true}
          responsive={responsive}
          ssr={true} // means to render carousel on server-side.
          infinite={false}
          autoPlay={false}
          autoPlaySpeed={1000}
          keyBoardControl={true}
          customTransition="transform 300ms ease-in-out"
          transitionDuration={500}
          containerClass="carousel-container"
          // focusOnSelect={true}
          // removeArrowOnDeviceType={["tablet", "mobile"]}
          deviceType={this.props.deviceType}
          dotListClass="custom-dot-list-style"
          itemClass="carousel-item-padding-30-px"
        >
          {
            this.state.buildScreenshots.map((buildScreenshot, index)  =>
            <div key={index}>
              <div className={`${ this.isSelectedId(buildScreenshot._id) ? "card-text-active" : ""}`}>{index + 1} - {buildScreenshot.view}</div>
              <img  className={`${ this.isSelectedId(buildScreenshot._id) ? "card-active" : ""}`} style={{ height: 250}} alt={buildScreenshot.view} src={"data:image/png;base64, " + buildScreenshot.thumbnail} onClick={(sh) => this.loadScreenshot(buildScreenshot._id)}/>
            </div>
          )}
        </Carousel>
        <Tabs id="image-tabs" defaultActiveKey="image" onSelect={(k) => this.setTab(k)}>
            <Tab eventKey="image" title="Image">
              <div className="image-page-holder">
              <Table>
                <tbody>
                  <tr>
                    <td>
                    <div>
                      <Table className="table-screenshot-details" bordered size="sm">
                        <thead>
                          <tr>
                            <th>Parameter</th>
                            <th>Value</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td><strong>View</strong></td>
                            <td>{this.state.currentScreenshotDetails.view}</td>
                          </tr>
                          <tr>
                            <td><strong>Date taken</strong></td>
                            <td>
                              <Moment format="DD-MM-YYYY HH:mm:ss">
                                {this.state.currentScreenshotDetails.timestamp}
                              </Moment>
                            </td>
                          </tr>
                          <tr>
                            <td><strong>Resolution</strong></td>
                            <td>{this.state.currentScreenshotDetails.width} x {this.state.currentScreenshotDetails.height}</td>
                          </tr>
                          <tr>
                            <td><strong>Platform Name</strong></td>
                            <td>{this.state.currentScreenshotDetails.platform.platformName}</td>
                          </tr>
                          <tr>
                            <td><strong>Browser</strong></td>
                            <td>{this.state.currentScreenshotDetails.platform.browserName}</td>
                          </tr>
                          <tr>
                            <td><strong>Version</strong></td>
                            <td>{this.state.currentScreenshotDetails.platform.browserVersion}</td>
                          </tr>
                          <tr>
                            <td><strong>Baseline Image</strong></td>
                            <td>{ this.isBaseline(this.state.currentScreenshotDetails._id) ? ("true"): "false" }</td>
                          </tr>
                        </tbody>
                      </Table>
                    </div>
                    </td>
                    <td>
                      { this.state.currentScreenshot ? ( <img className="screenshot" src={this.state.currentScreenshot} alt="Screenshot" /> ) : null }
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <span style={{ float: "left" }}>
                        <button onClick={() => this.updateBaseline(this.state.currentScreenshotDetails) } disabled={ this.isBaseline(this.state.currentScreenshotDetails._id) } type="button" className="btn btn-outline-primary">{ !this.isBaseline(this.state.currentScreenshotDetails._id) ? ("Make Baseline Image"): "This is the Baseline Image"}</button>
                      </span>
                    </td>
                  </tr>
                </tbody>
              </Table>
              </div>
            </Tab>
            <Tab eventKey="history" title="History">
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
                                      </td>
                                    </tr>
                                    <tr>
                                      <td><strong>Resolution: </strong>{screenshot.width} x {screenshot.height}</td>
                                    </tr>
                                    <tr>
                                      <td><strong>Platform: </strong>{ screenshot.platform ? (screenshot.platform.platformName) : "" } { screenshot.platform && screenshot.platform.browserName ? ( ` (${screenshot.platform.browserName}${ screenshot.platform.browserVersion ? (" " + screenshot.platform.browserVersion) : "" })` ) : "" }</td>
                                    </tr>
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
            <Tab eventKey="baseline" title="Compare with Baseline">
              <div className="image-page-holder">{ this.state.currentBaselineCompare ? ( this.isBaseline(this.state.currentScreenshotDetails._id) ? ("The current image is the baseline"): <img className="screenshot" src={this.state.currentBaselineCompare} alt="Compare" /> ) : "No Baseline selected yet for this view and deviceName or browser combination. To select a baseline, navigate to the image you want as a baseline and click on the \"Make Baseline Image\" button" }</div>
            </Tab>
        </Tabs>
      </div>
    );
  }
}

export default ScreenshotView;
