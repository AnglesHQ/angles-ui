import React, { Component } from 'react';

import { push as Menu } from 'react-burger-menu';
import './AnglesMenu.css';
import { withRouter } from 'react-router-dom';

class AnglesMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      menuOpen: false,
    };
  }

  handleStateChange = (state) => {
    this.setState({ menuOpen: state.isOpen });
  };

  render() {
    const { menuOpen } = this.state;
    return (
      <Menu isOpen={menuOpen} onStateChange={this.handleStateChange} pageWrapId="page-wrap" outerContainerId="outer-container" className="bm-menu">
        <a id="builds-page" className="bm-item" href="/">
          <i className="fa fa-fw fa-chart-bar" />
          <span>Builds</span>
        </a>
        <a id="metrics-page" className="bm-item" href="/metrics">
          <i className="fa fa-fw fa-chart-pie" />
          <span>Metrics</span>
        </a>
        <a id="screenshot-finder" className="bm-item" href="/screenshot-finder">
          <i className="fa fa-fw fa-images" />
          <span>Screenshot Library</span>
        </a>
        <a id="about" className="bm-item" href="/about">
          <i className="fa fa-fw fa-info" />
          <span>About Angles</span>
        </a>

        <img src="/assets/angles-logo.png" className="angles-logo-menu" alt="Angles" />
      </Menu>
    );
  }
}

export default withRouter(AnglesMenu);
