// TODO: add page to find screenshots by tag or by view (and maybe add platform filter).
import React, { Component } from 'react'
import Moment from 'react-moment';
import axios from 'axios';
import Table from 'react-bootstrap/Table'
import CardDeck from 'react-bootstrap/CardDeck'
import Card from 'react-bootstrap/Card'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import 'react-multi-carousel/lib/styles.css';
import './Default.css'
import queryString from 'query-string';

class ScreenshotFinderPage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      groupedScreenshots: undefined,
      groupType: undefined,
      query: queryString.parse(this.props.location.search),
      view: "",
      tag: ""
    };
    if (this.state.query.view) {
      this.getGroupedScreenshotByPlatform(this.state.query.view);
    } else if (this.state.query.tag) {
      this.getGroupedScreenshotByTag(this.state.query.tag);
    }
    // this.handleViewChange = this.handleViewChange.bind(this);
    // this.handleTagChange = this.handleTagChange.bind(this);
    // this.submitScreenshotSearch = this.submitScreenshotSearch.bind(this);
  }

  getGroupedScreenshotByPlatform = (view) => {
    return axios.get('/screenshot/grouped/platform', {
      params: {
        view
      }
    })
    .then((res) => {
      this.setState({ view, groupType: "view", groupedScreenshots: res.data });
    })
  }

  getGroupedScreenshotByTag = (tag) => {
    return axios.get('/screenshot/grouped/tag', {
      params: {
        tag
      }
    })
    .then((res) => {
      this.setState({ tag, groupType: "tag", groupedScreenshots: res.data });
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

  handleViewChange = (event) => {
    this.setState({view: event.target.value, tag: ""});
  }

  handleTagChange = (event) => {
    this.setState({tag: event.target.value, view: ""});
  }

  submitScreenshotSearch = (event) => {
    event.preventDefault();
    if (this.state.view !== "") {
      this.getGroupedScreenshotByPlatform(this.state.view);
    } else if (this.state.tag !== "") {
      this.getGroupedScreenshotByTag(this.state.tag);
    }
  }

  render() {
    return (
      <div>
        <h1>Screenshot finder</h1>
        <Form onSubmit={this.submitScreenshotSearch}>
          <Form.Row>
            <Form.Group as={Col}>
              <Form.Label htmlFor="viewInput"><b>View</b></Form.Label>
              <Form.Control type="text" id="viewInput" value={this.state.view } onChange={this.handleViewChange} />
              <Form.Text id="viewInput" muted>
                Please fill in the view OR the tag input and click submit.
              </Form.Text>
            </Form.Group>
            <div className={`screenshot-finder-form-or-div`}>OR</div>
            <Form.Group as={Col}>
              <Form.Label htmlFor="tagInput"><b>Tag</b></Form.Label>
              <Form.Control type="text" id="tagInput" value={this.state.tag } onChange={this.handleTagChange} />
            </Form.Group>
          </Form.Row>
          <Button variant="primary" type="submit">Search Screenshots</Button>
        </Form>
        <br/>
        <CardDeck className="card-deck-history">
          { this.state.groupedScreenshots != null ? (
            this.state.groupedScreenshots.map((screenshot, index) => {
              return [
                  <Card key={index} className={`screenshotCard`}>
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
                            <tr>
                              <td><strong>PlatformId: </strong>{ screenshot.platformId } </td>
                            </tr>
                          </tbody>
                        </Table>
                      </div>
                      </Card.Footer>
                    </Card.Body>
                  </Card>
              ]
            })
          ) : "No screenshots to display" }
        </CardDeck>
      </div>
    );
  }
}

export default ScreenshotFinderPage;
