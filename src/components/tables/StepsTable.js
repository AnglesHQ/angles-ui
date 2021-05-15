/* eslint react/no-array-index-key: [0] */
import React, { Component } from 'react';
import Moment from 'react-moment';
import parse from 'html-react-parser';
import { withRouter } from 'react-router-dom';
import '../pages/Default.css';

class StepsTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      screenshots: props.screenshots,
    };
  }

  getScreenShot = (screenshotId) => {
    const { screenshots } = this.state;
    if (screenshots !== undefined && screenshotId !== undefined) {
      const image = screenshots.filter((screenshot) => screenshot._id === screenshotId)[0];
      if (image !== undefined) {
        return image.thumbnail;
      }
    }
    return undefined;
  }

  navigateToImageDetails = (imageId) => {
    const { history } = this.props;
    history.push(`/image/${imageId}`);
  }

  convertTextToLinks = (content) => {
    const reg = /(http:\/\/|https:\/\/)((\w|=|\?|\.|\/|&|-)+)/g;
    return content.replace(reg, "<a href='$1$2' target='_blank'>$1$2</a>");
  }

  render() {
    const { index, action, openModal } = this.props;
    return [
      <table className="steps-table" key={`steps_table_${index}`}>
        <thead>
          <tr>
            <th width="3%">#</th>
            <th width="8%">Time</th>
            <th width="7%">Status</th>
            <th width="20%">Step</th>
            <th width="15%">Expected</th>
            <th width="15%">Actual</th>
            <th width="25%">Info</th>
            <th width="8%">Screenshot</th>
          </tr>
        </thead>
        <tbody>
          { action.steps.map((step, stepIndex) => {
            if (step.status === 'ERROR' || step.status === 'INFO' || step.status === 'DEBUG') {
              return (
                <tr key={`steps_${stepIndex}`}>
                  <td>{stepIndex + 1}</td>
                  <td><Moment format="HH:mm:ss">{step.timestamp}</Moment></td>
                  <td className={`${step.status}`}>{step.status}</td>
                  <td colSpan={4}>
                    <pre>
                      {parse(this.convertTextToLinks(step.info))}
                    </pre>
                  </td>
                  {
                    step.screenshot ? (
                      <td onClick={() => openModal(step.screenshot)}>
                        <img
                          className="screenshot-thumbnail"
                          src={`data:image/png;base64, ${this.getScreenShot(step.screenshot)}`}
                          alt="Thumbnail"
                        />
                      </td>
                    ) : <td />
                  }
                </tr>
              );
            }
            return (
              <tr key={`steps_${stepIndex}`}>
                <td>{stepIndex + 1}</td>
                <td><Moment format="HH:mm:ss">{step.timestamp}</Moment></td>
                <td className={`${step.status}`}>{step.status}</td>
                <td>{step.name}</td>
                <td>{step.expected}</td>
                <td>{step.actual}</td>
                <td>
                  <pre>
                    { parse(this.convertTextToLinks(step.info)) }
                  </pre>
                </td>
                {
                  step.screenshot ? (
                    <td onClick={() => openModal(step.screenshot)}>
                      <img
                        className="screenshot-thumbnail"
                        src={`data:image/png;base64, ${this.getScreenShot(step.screenshot)}`}
                        alt="Thumbnail"
                      />
                    </td>
                  ) : <td />
                }
              </tr>
            );
          })}
        </tbody>
      </table>,
    ];
  }
}

export default withRouter(StepsTable);
