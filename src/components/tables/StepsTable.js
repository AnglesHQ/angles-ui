import React, { Component } from 'react'
import Moment from 'react-moment';
import { withRouter} from 'react-router-dom';
import '../pages/Default.css'
import queryString from 'query-string';

class StepsTable extends Component {

  constructor(props) {
    super(props);
    this.state = {
      screenshots : props.screenshots,
      query: queryString.parse(this.props.location.search),
    };
  }

  getScreenShot = (screenshotId) => {
    let thumbnail = undefined;
    if (this.state.screenshots !== undefined && screenshotId !== undefined) {
      let image = this.state.screenshots.filter(screenshot => screenshot._id === screenshotId)[0];
      if (image !== undefined) {
        return image.thumbnail;
      }
    }
    return thumbnail;
  }

  navigateToImageDetails = (imageId) => {
    let history = this.props.history;
    history.push(`/image/${imageId}`)
  }

  render () {
    return [
      <table className="steps-table" key={"steps_table_" + this.props.index}>
        <thead>
          <tr>
            <th>#</th>
            <th>Time</th>
            <th>Status</th>
            <th width="15%">Step</th>
            <th>Expected</th>
            <th>Actual</th>
            <th width="25%">Info</th>
            <th>Screenshot</th>
          </tr>
        </thead>
        <tbody>
          { this.props.action.steps.map((step, index) => {
            if (step.status === "ERROR" || step.status == "INFO") {
              return <tr key={"steps_" + index}>
                <td>{index+1}</td>
                <td><Moment format="HH:mm:ss">{step.time}</Moment></td>
                <td className={`${step.status}`}>{step.status}</td>
                <td colSpan={4}>{step.info}</td>
                {
                  step.screenshot ? (<td onClick={() => this.props.openModal(step.screenshot)}>
                      <img className="screenshot-thumbnail"
                           src={"data:image/png;base64, " + this.getScreenShot(step.screenshot)}
                           alt="Thumbnail"/></td>) : <td/>
                }
              </tr>
            }

            return <tr key={"steps_" + index}>
              <td>{index+1}</td>
              <td><Moment format="HH:mm:ss">{step.time}</Moment></td>
              <td className={`${step.status}`}>{step.status}</td>
              <td>{step.name}</td>
              <td>{step.expected}</td>
              <td>{step.actual}</td>
              <td>{step.info}</td>
              {
                step.screenshot ? (<td onClick={() => this.openModal(step.screenshot)}>
                  <img className="screenshot-thumbnail"
                       src={"data:image/png;base64, " + this.getScreenShot(step.screenshot)}
                       alt="Thumbnail"/></td>) : <td/>
              }
             </tr>
            })
          }
        </tbody>
      </table>
    ]
  }
};

export default withRouter(StepsTable)
