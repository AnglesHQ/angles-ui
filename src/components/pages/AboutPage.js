// TODO: add page to find screenshots by tag or by view (and maybe add platform filter).
import React, { Component } from 'react'
import 'react-multi-carousel/lib/styles.css';
import './Default.css'

class AboutPage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      //
    };
  }

  render() {
    return (
      <div>
        <h1>About Angles</h1>
        <div>
          Angles is an open-source framework to store results for automated test runs from various frameworks.
        </div>
        <br/>
        <div>
          By providing a clearly defined <a href="https://editor.swagger.io/?url=https://raw.githubusercontent.com/AnglesHQ/angles/master/swagger/swagger.json" rel="noreferrer" target="_blank">API</a> any framework can be adapted to store it's test result in Angles, using one of the clients provided (or by using the API directly)
        </div>
        <br/>
        <div>
          For more information about Angles go to our Github project: <br/>
          <a href="https://github.com/AnglesHQ/angles" rel="noreferrer" target="_blank">https://github.com/AnglesHQ/angles</a>
        </div>
      </div>
    );
  }
}

export default AboutPage;
