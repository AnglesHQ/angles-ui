import React, { Component } from 'react'
import Moment from 'react-moment';
import axios from 'axios';
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'
import CardDeck from 'react-bootstrap/CardDeck'
import Card from 'react-bootstrap/Card'
import './Default.css'

class ScreenshotView extends Component {

  constructor(props) {
    super(props);
    this.state = {
      buildScreenshots: this.props.buildScreenshots
    };
    this.loadScreenshot(this.props.selectedScreenshotId)
  }

  componentDidMount() {
  }

  getScreenshotDetails(screenshotId) {
    return axios.get('/screenshot/' + screenshotId)
    .then((res) => {
      this.setState({ currentScreenshotDetails: res.data })
      if (this.state.currentScreenshotDetails != null && this.state.currentScreenshotDetails.view != null) {
        // if there is a view, retrieve the history
        this.getScreenshotHistoryByView(this.state.currentScreenshotDetails.view, 5);
      }
    })
  }

  getScreenshotHistoryByView(view, limit, offset) {
    return axios.get('/screenshot/', {
      params: {
        view,
        limit,
        offset
      }
    })
    .then((res) => {
      this.setState({ currentScreenshotHistory: res.data });
      this.getScreenshotCompare(this.state.currentScreenshotDetails._id, this.state.currentScreenshotHistory[0]._id);
    })

  }

  getScreenshot(screenshotId) {
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

  getScreenshotCompare(screenshotId, baselineId) {
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

  setTab(key) {
    if (key === "baseline" && this.state.currentScreenshotHistory != null && this.state.currentBaselineCompare == null && this.state.currentScreenshotHistory.length > 1) {
        //TODO: determine baseline images from history (if none grab previous image) etc.
    }
  }

  loadScreenshot(screenshotId) {
    this.getScreenshotDetails(screenshotId);
    this.getScreenshot(screenshotId);
  }

  isSelectedId(screenshotId) {
    if (this.state.currentScreenshotDetails && this.state.currentScreenshotDetails._id === screenshotId) {
      return true;
    } else {
      return false;
    }
  }
  render() {
    if (!this.state.currentScreenshotDetails) {
      return <div><span>no details</span></div>;
    }
    return (
      <div >
        <div>
          <CardDeck>
            {
              this.state.buildScreenshots.map((buildScreenshot, index) => {
                return [
                  <Card key={index} className={`thumbnail-card ${ this.isSelectedId(buildScreenshot._id) ? "card-active" : ""}`} onClick={(sh) => this.loadScreenshot(buildScreenshot._id)}>
                    <Card.Img variant="top" src={"data:image/png;base64, " + buildScreenshot.thumbnail} />
                    <Card.Body>
                      <Card.Text className={`thumbnail-card-text ${ this.isSelectedId(buildScreenshot._id) ? "card-text-active" : ""}`}>
                        {buildScreenshot.view}
                      </Card.Text>
                    </Card.Body>
                  </Card>
                ]
              })
            }
          </CardDeck>
        </div>
        <Tabs id="image-tabs" defaultActiveKey="image" onSelect={(k) => this.setTab(k)}>
            <Tab eventKey="image" title="Image">
              <div className="image-page-holder">
              <div>
              Date:
              <Moment format="DD-MM-YYYY HH:mm:ss">
                {this.state.currentScreenshotDetails.timestamp}
              </Moment>
              </div>
              { this.state.currentScreenshot ? ( <img className="screenshot" src={this.state.currentScreenshot} alt="Screenshot" /> ) : null }
              </div>
            </Tab>
            <Tab eventKey="baseline" title="Baseline">
              <div className="image-page-holder">{ this.state.currentBaselineCompare ? ( <img className="screenshot" src={this.state.currentBaselineCompare} alt="Compare" /> ) : "No Baseline Available" }</div>
            </Tab>
            <Tab eventKey="history" title="History">
              <div className="image-page-holder">
                <CardDeck>
                  { this.state.currentScreenshotHistory != null ? (
                    this.state.currentScreenshotHistory.map((screenshot, index) => {
                      return [
                          <Card key={index} className={`screenshotCard ${ this.isSelectedId(screenshot._id) ? "card-active" : ""}`}>
                            <Card.Img variant="top" src={"data:image/png;base64, " + screenshot.thumbnail} />
                            <Card.Body>
                              <Card.Text>
                                  resolution and device details here.
                              </Card.Text>
                            </Card.Body>
                            <Card.Footer>
                              <small className="text-muted">
                                Date:
                                <Moment format="DD-MM-YYYY HH:mm:ss">
                                  {screenshot.timestamp}
                                </Moment>
                              </small>
                            </Card.Footer>
                          </Card>
                      ]
                    })
                  ) : "N/A" }
                </CardDeck>
              </div>
            </Tab>
        </Tabs>
      </div>
    );
  }
}

export default ScreenshotView;
