import React, { Component } from 'react'
import Moment from 'react-moment';

class StepsTable extends Component {

  constructor(props) {
    super(props);
    this.state = {
      screenshots : props.screenshots
    };
  }

  getScreenShot(screenshotId) {
    let thumbnail = undefined;
    if (this.state.screenshots !== undefined && screenshotId !== undefined) {
      let image = this.state.screenshots.filter(screenshot => screenshot._id === screenshotId)[0];
      return image.thumbnail;
    }
    return thumbnail;
  }

  render () {
    return [
      <table className="steps-table">
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
            return <tr key={"steps_" + index}>
              <td>{index+1}</td>
              <td><Moment format="HH:mm:ss">{step.time}</Moment></td>
              <td className={`${step.status}`}>{step.status}</td>
              <td>{step.name}</td>
              <td>{step.expected}</td>
              <td>{step.actual}</td>
              <td>{step.info}</td>
              <td>{ step.screenshot ? ( <img className="screenshot-thumbnail" src={"data:image/png;base64, " + this.getScreenShot(step.screenshot)} alt="Thumbnail" /> ) : null }</td>
            </tr>
            })
          }
        </tbody>
      </table>
    ]
  }
};

export default StepsTable
