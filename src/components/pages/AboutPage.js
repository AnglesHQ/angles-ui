import { React, Component } from 'react';
import 'react-multi-carousel/lib/styles.css';
import './Default.css';
import axios from 'axios';
import { AnglesRequests } from 'angles-javascript-client';
import Table from 'react-bootstrap/Table';

const { version } = require('../../../package.json');

class AboutPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      //
    };
    this.anglesRequests = new AnglesRequests(axios);
  }

  componentDidMount() {
    this.anglesRequests.getVersions()
      .then((versions) => {
        this.setState({ versions });
      });
  }

  render() {
    const { versions } = this.state;
    return (
      <div>
        <h1>About Angles</h1>
        <div>
          Angles is an open-source framework to store results for
          automated test runs from various frameworks.
        </div>
        <br />
        <div>
          <span>By providing a clearly defined </span>
          <a href="https://editor.swagger.io/?url=https://raw.githubusercontent.com/AnglesHQ/angles/master/swagger/swagger.json" rel="noreferrer" target="_blank">API</a>
          <span>
            &nbsp;any framework can be adapted to store its test result in Angles,
            using one of the clients provided (or by using the API directly)
          </span>
        </div>
        <br />
        <div>
          For more information about Angles go to page:
          <br />
          <a href="https://angleshq.github.io/" rel="noreferrer" target="_blank">https://angleshq.github.io/</a>
        </div>
        <div>
          <br />
          {
            versions ? (
              <Table className="about-versions-table" size="sm">
                <tr className="thead-dark">
                  <th scope="col">Component</th>
                  <th scope="col">Version</th>
                </tr>
                <tbody>
                  <tr>
                    <td>Angles Frontend</td>
                    <td>{version}</td>
                  </tr>
                  <tr>
                    <td>Angles Backend</td>
                    <td>{versions.angles}</td>
                  </tr>
                  <tr>
                    <td>Node</td>
                    <td>{versions.node}</td>
                  </tr>
                  <tr>
                    <td>Mongo</td>
                    <td>{versions.mongo}</td>
                  </tr>
                </tbody>
              </Table>
            ) : null
          }
        </div>
      </div>
    );
  }
}

export default AboutPage;
