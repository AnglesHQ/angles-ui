import React, { useState } from 'react';
import './AnglesMenu.css';
import { Sidenav, Nav } from 'rsuite';
import DashboardIcon from '@rsuite/icons/legacy/Dashboard';
import InfoOutlineIcon from '@rsuite/icons/InfoOutline';
import PieChartIcon from '@rsuite/icons/PieChart';
import ImageIcon from '@rsuite/icons/Image';

const AnglesMenu = function () {
  const [expanded, setExpanded] = useState(false);
  const [activeKey, setActiveKey] = useState('1');

  return (
    <div style={{ width: 240 }}>
      <Sidenav expanded={expanded} defaultOpenKeys={['3', '4']}>
        <Sidenav.Toggle expanded={expanded} onToggle={(expand) => setExpanded(expand)} />
        <Sidenav.Body>
          <Nav activeKey={activeKey} onSelect={setActiveKey}>
            <Nav.Item eventKey="1" icon={<DashboardIcon />} href="/">
              Builds
            </Nav.Item>
            <Nav.Item eventKey="2" icon={<PieChartIcon />} href="/metrics">
              Metrics
            </Nav.Item>
            <Nav.Item eventKey="2" icon={<ImageIcon />} href="/screenshot-library">
              Screenshot Library
            </Nav.Item>
            <Nav.Item eventKey="4" icon={<InfoOutlineIcon />} href="/about">
              About Angles
            </Nav.Item>
          </Nav>
        </Sidenav.Body>
      </Sidenav>
      {/* <img src="/assets/angles-logo.png" className="angles-logo-menu" alt="Angles" /> */}
    </div>
  );
};

export default AnglesMenu;
