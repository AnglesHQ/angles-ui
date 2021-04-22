import React, { Component } from 'react';
import Moment from 'react-moment';
import OverlayTrigger from 'react-bootstrap//OverlayTrigger';
import Tooltip from 'react-bootstrap//Tooltip';
import { getDuration } from '../../utility/TimeUtilities';

class BuildSummary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      //
    };
  }

  render() {
    const { build, screenshots, openModal } = this.props;
    const buildComponent = build.team.components
      .filter((component) => component._id === build.component)[0];
    return (
      <table className="table">
        <thead className="thead-dark">
          <tr>
            <th scope="col" colSpan="100%">Build Summary</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">Name</th>
            <td>{build.name}</td>
            <th scope="row">Pass</th>
            <td>{build.result.PASS}</td>
          </tr>
          <tr>
            <th scope="row">Component</th>
            <td>{ buildComponent.name}</td>
            <th scope="row">Fail</th>
            <td>{build.result.FAIL}</td>
          </tr>
          <tr>
            <th scope="row">Environment</th>
            <td>{build.environment.name}</td>
            <th scope="row">Error</th>
            <td>{build.result.ERROR}</td>
          </tr>
          <tr>
            <th scope="row">Start</th>
            <td>
              <Moment format="DD-MM-YYYY HH:mm:ss">
                {build.start}
              </Moment>
            </td>
            <th scope="row">Skipped</th>
            <td>{build.result.SKIPPED}</td>
          </tr>
          <tr>
            <th scope="row">Finish</th>
            <td>
              <Moment format="DD-MM-YYYY HH:mm:ss">
                {build.end}
              </Moment>
            </td>
            <th scope="row">Screenshots</th>
            <td>
              {
                screenshots && screenshots.length > 0 ? (
                  <div>
                    <span>
                      {`${screenshots.length} (`}
                      <a
                        href="/"
                        onClick={(e) => {
                          e.preventDefault();
                          return openModal(screenshots[0]._id, false);
                        }}
                      >
                        see screenshots
                      </a>
                      )
                    </span>
                  </div>
                )
                  : 0
              }
            </td>
          </tr>
          <tr>
            <th scope="row">Duration</th>
            <td>{getDuration(build)}</td>
            <th scope="row">
              <span>Keep flag set </span>
              <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">By setting the &quot;keep&quot; flag the build will not be removed by the nightly clean-up.</Tooltip>}>
                <span>
                  <i className="far fa-question-circle" />
                </span>
              </OverlayTrigger>
            </th>
            <td>{ build.keep ? 'true' : 'false'}</td>
          </tr>
        </tbody>
      </table>
    );
  }
}

export default BuildSummary;
