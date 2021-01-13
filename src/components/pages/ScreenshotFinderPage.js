// TODO: add page to find screenshots by tag or by view (and maybe add platform filter).
import React, { Component } from 'react'
import axios from 'axios';
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import Table from 'react-bootstrap/Table';
import ImageCarousel from '../elements/ImageCarousel';
import ScreenshotDetailsTable from '../tables/ScreenshotDetailsTable';
import 'react-multi-carousel/lib/styles.css';
import './Default.css'
import queryString from 'query-string';

class ScreenshotFinderPage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      groupedScreenshots: undefined,
      filteredScreenshots: undefined,
      platforms: undefined,
      groupType: undefined,
      selectedScreenshot: undefined,
      currentScreenshotDetails: undefined,
      query: queryString.parse(this.props.location.search),
      view: "",
      tag: "",
      numberOfDays: 14
    };
    if (this.state.query.view) {
      this.getGroupedScreenshotByPlatform(this.state.query.view, this.state.query.numberOfDays ? (this.state.query.numberOfDays) : this.state.numberOfDays);
    } else if (this.state.query.tag) {
      this.getGroupedScreenshotByTag(this.state.query.tag, this.state.query.numberOfDays ? (this.state.query.numberOfDays) : this.state.numberOfDays);
    }
  }

  getGroupedScreenshotByPlatform = (view, numberOfDays) => {
    return axios.get('/screenshot/grouped/platform', {
      params: {
        view,
        numberOfDays
      }
    })
    .then((res) => {
      this.setState({ view, numberOfDays, groupType: "view", groupedScreenshots: res.data });
    })
  }

  getGroupedScreenshotByTag = (tag, numberOfDays) => {
    return axios.get('/screenshot/grouped/tag', {
      params: {
        tag,
        numberOfDays
      }
    })
    .then((res) => {
      let uniquePlatforms = [];
      res.data.forEach((screenshot) => {
          if (!uniquePlatforms.includes(screenshot.platformId)){
            uniquePlatforms.push(screenshot.platformId);
          }
      })
      uniquePlatforms.sort();
      let filteredScreenshots = res.data.filter(screenshot => screenshot.platformId === uniquePlatforms[0]);
      this.setState({ tag, numberOfDays, groupType: "tag", groupedScreenshots: res.data, filteredScreenshots: filteredScreenshots, platforms: uniquePlatforms });
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

  getScreenshotDetails = (screenshotId) => {
    let filteredScreenshots = this.state.groupedScreenshots.filter(screenshot => screenshot._id === screenshotId);
    if (filteredScreenshots.length > 0) {
      this.setState({currentScreenshotDetails: filteredScreenshots[0]});
    } else {
      this.setState({currentScreenshotDetails: undefined});
    }
  }

  loadScreenshot = (screenshotId) => {
    this.getScreenshotDetails(screenshotId);
    this.getScreenshot(screenshotId);
  }

  handleViewChange = (event) => {
    this.setState({view: event.target.value, tag: ""});
  }

  handleTagChange = (event) => {
    this.setState({tag: event.target.value, view: ""});
  }

  handleNumberOfDaysChange = (event) => {
    this.setState({numberOfDays: event.target.value});
  }

  submitScreenshotSearch = (event) => {
    event.preventDefault();
    this.setState({currentScreenshotDetails: undefined});
    if (this.state.view !== "") {
      this.getGroupedScreenshotByPlatform(this.state.view, this.state.numberOfDays);
    } else if (this.state.tag !== "") {
      this.getGroupedScreenshotByTag(this.state.tag, this.state.numberOfDays);
    }
  }

  filterByPlatform = (event) => {
    let filteredScreenshots = this.state.groupedScreenshots.filter(screenshot => screenshot.platformId === event.target.value);
    this.setState({ filteredScreenshots: filteredScreenshots, currentScreenshotDetails: undefined });
  }

  render() {
    return (
      <div>
        <h1>Screenshot finder</h1>
        <div className={`screenshot-form-container`}>
        <Form onSubmit={this.submitScreenshotSearch}>
          <Form.Row>
            <Form.Group as={Col} className={"tag-form-group"}>
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
          <Form.Row>
            <Form.Group as={Col}>
              <Form.Label htmlFor="numberOfDays"><b>Number of days</b></Form.Label>
              <Form.Control id="numberOfDays" as="select" value={ this.state.numberOfDays } onChange={this.handleNumberOfDaysChange} >
                <option key="1" value="1">1 Day</option>
                <option key="2" value="7">1 Week</option>
                <option key="3" value="14">2 Weeks</option>
                <option key="4" value="31">1 Month</option>
                <option key="5" value="90">3 Months</option>
                <option key="6" value="180">6 Months</option>
              </Form.Control>
              <Button variant="primary" type="submit" className={"search-button"}>Search Screenshots</Button>
            </Form.Group>
            <Form.Group as={Col} className={"tag-form-group tag-form-group-platform"}>
              {
                 this.state.groupType === "tag" && this.state.platforms && this.state.platforms.length > 0 ? (
                    <div>
                       <Form.Label htmlFor="platformSelect"><b>Platform ({this.state.platforms.length})</b></Form.Label>
                       <Form.Control id="platformSelect" as="select" onChange={ this.filterByPlatform }>
                         {
                           this.state.platforms.map((platform, index) => {
                               return <option key={platform}>{platform}</option>
                           })
                         }
                       </Form.Control>
                     </div>
                 ) : null
              }
            </Form.Group>
          </Form.Row>
        </Form>
        </div>
        {
          this.state.groupedScreenshots ? (
            <div>
            <br/>
            <ImageCarousel
              screenshots={ this.state.groupType === "tag" ? (this.state.filteredScreenshots) : this.state.groupedScreenshots }
              selectedScreenshotDetails={this.state.currentScreenshotDetails}
              loadScreenshot={this.loadScreenshot}
            />
            {
              this.state.currentScreenshotDetails ? (
                <Table>
                  <tbody>
                    <tr>
                      <td>
                      <div>
                        <ScreenshotDetailsTable currentScreenshotDetails={this.state.currentScreenshotDetails } />
                      </div>
                      </td>
                      <td>
                        { this.state.currentScreenshot ? ( <img className="screenshot" src={this.state.currentScreenshot} alt="Screenshot" /> ) : null }
                      </td>
                    </tr>
                  </tbody>
                </Table>
              ) : "Select one of the images to display details."
            }
            </div>
          ) : null
        }
      </div>
    );
  }
}

export default ScreenshotFinderPage;
