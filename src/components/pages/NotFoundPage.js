import React, { Component } from 'react';
import Alert from 'react-bootstrap/Alert';
import 'react-multi-carousel/lib/styles.css';
import './Default.css';

class NotFoundPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      //
    };
  }

  render() {
    return (
      <div>
        <h1>404</h1>
        <div>
          <Alert variant="warning">
            <span>Oops, we were unable to find the page you were looking for. Click </span>
            <a href="/" target="_self">here</a>
            <span> to go back to home page.</span>
          </Alert>
        </div>
      </div>
    );
  }
}

export default NotFoundPage;
