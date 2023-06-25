import React, { useState } from 'react';
import { push as Menu } from 'react-burger-menu';

import './AnglesMenu.css';

const AnglesMenu = function () {
  const [menuState, setMenuState] = useState(false);
  const [isOpen] = useState(false);

  const handleStateChange = () => {
    setMenuState(isOpen);
  };

  return (
    <Menu isOpen={menuState} onStateChange={handleStateChange} pageWrapId="page-wrap" outerContainerId="outer-container" className="bm-menu">
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
};

export default AnglesMenu;
