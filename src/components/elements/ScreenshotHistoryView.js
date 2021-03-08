import React, { Component } from 'react';
import CardDeck from 'react-bootstrap/CardDeck';
import Card from 'react-bootstrap/Card';
import Table from 'react-bootstrap/Table';
import Moment from 'react-moment';

class ScreenshotHistoryView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      //
    };
  }

  isSelectedId = (screenshotId) => {
    const { currentScreenshotDetails } = this.props;
    if (currentScreenshotDetails && currentScreenshotDetails._id === screenshotId) {
      return true;
    }
    return false;
  }

  render() {
    const {
      currentScreenshotHistory,
      isBaseline,
    } = this.props;

    if (currentScreenshotHistory == null) {
      return (
        <div className="alert alert-primary" role="alert">
          <span>
            <i className="fas fa-spinner fa-pulse fa-2x" />
            <span> Loading history.</span>
          </span>
        </div>
      );
    }

    return (
      <CardDeck className="card-deck-history">
        {currentScreenshotHistory.map((screenshot) => [
          <Card key={screenshot._id} className={`screenshotCard ${this.isSelectedId(screenshot._id) ? 'card-active' : ''}`}>
            { isBaseline(screenshot._id) ? (<div className="card-img-overlay baseline-overlay"><p>baseline</p></div>) : null }
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
    );
  }
}

export default ScreenshotHistoryView;
