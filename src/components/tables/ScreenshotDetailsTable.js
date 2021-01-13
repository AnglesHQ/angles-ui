import React, { Component } from 'react'
import Moment from 'react-moment';
import Table from 'react-bootstrap/Table'
import { withRouter} from 'react-router-dom';
import '../pages/Default.css'

class ScreenshotDetailsTable extends Component {

  constructor(props) {
    super(props);
    this.state = {
    };
  }

  navigateToTagsPage = (tag, e) => {
    e.preventDefault();
    this.props.history.push(`/screenshot-finder/?tag=${tag}`);
  }

  navigateToViewsPage = (view, e) => {
    e.preventDefault();
    this.props.history.push(`/screenshot-finder/?view=${view}`);
  }

  render () {
    return <Table className="table-screenshot-details" bordered size="sm">
      <thead>
        <tr>
          <th>Parameter</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>View</strong></td>
          <td> { this.props.currentScreenshotDetails.view ? (
              <span> { this.props.currentScreenshotDetails.view } <a title={`Find all the latest screenshots for view "${this.props.currentScreenshotDetails.view}", grouped by platform.`} href="/" onClick={(e) => this.navigateToViewsPage(this.props.currentScreenshotDetails.view, e)}>see other platforms</a></span>
            ) : "No view provided"}
          </td>
        </tr>
        <tr>
          <td><strong>Date taken</strong></td>
          <td>
            <Moment format="DD-MM-YYYY HH:mm:ss">
              {this.props.currentScreenshotDetails.timestamp}
            </Moment>
          </td>
        </tr>
        <tr>
          <td><strong>Resolution</strong></td>
          <td>{this.props.currentScreenshotDetails.width} x {this.props.currentScreenshotDetails.height}</td>
        </tr>
        <tr>
          <td><strong>Platform Name</strong></td>
          <td>{ this.props.currentScreenshotDetails.platform ? this.props.currentScreenshotDetails.platform.platformName : "No platform provided"}</td>
        </tr>
        <tr>
          <td><strong>Browser</strong></td>
          <td>{this.props.currentScreenshotDetails.platform ? this.props.currentScreenshotDetails.platform.browserName: "No browser provided"}</td>
        </tr>
        <tr>
          <td><strong>Version</strong></td>
          <td>{ this.props.currentScreenshotDetails.platform ? this.props.currentScreenshotDetails.platform.browserVersion: "No browser version provided"}</td>
        </tr>
        {
          this.props.isBaseline !== undefined ? (
            <tr>
              <td><strong>Baseline Image</strong></td>
              <td>{ this.props.isBaseline ? ("true"): "false" }</td>
            </tr>
          ): null
        }
        <tr>
          <td><strong>Tags</strong></td>
          <td>{
              this.props.currentScreenshotDetails.tags.map((tag, index) => {
                return <a key={index} title={`Find all the latest screenshots with tag "${tag}", grouped by view.`} href="/" onClick={(e) => this.navigateToTagsPage(tag, e)}>{tag}</a>
              })
            }</td>
        </tr>
      </tbody>
    </Table>
  }
};

export default withRouter(ScreenshotDetailsTable)
