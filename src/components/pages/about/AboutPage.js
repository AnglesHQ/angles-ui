import React, { useEffect, useState } from 'react';
import {
  Panel,
} from 'rsuite';
import axios from 'axios';
import { AnglesRequests } from 'angles-javascript-client';
import AboutTable from './AboutTable';

const AboutPage = function () {
  const [versions, setVersions] = useState(null);
  const anglesRequests = new AnglesRequests(axios);

  useEffect(() => {
    anglesRequests.getVersions()
      .then((retrievedVersions) => {
        setVersions(retrievedVersions);
      });
  }, []);

  return (
    <div>
      <Panel
        bordered
        className="about-page-panel"
        header={<span>About Angles</span>}
      >
        <div className="about-page-section">
          <span>
            Angles is an open-source framework to store results for
            automated test runs from various frameworks.
          </span>
        </div>
        <div className="about-page-section">
          <span>
            By providing a clearly defined
            <a href="src/components/pages/about/AboutPage?url=https://raw.githubusercontent.com/AnglesHQ/angles/master/swagger/swagger.json" rel="noreferrer" target="_blank"> API </a>
            any framework can be adapted to store its test result in Angles,
            using one of the clients provided (or by using the API directly)
          </span>
        </div>
        <div className="about-page-section">
          For more information about Angles go to page:
          <a href="src/components/pages/about/AboutPage" rel="noreferrer" target="_blank"> https://angleshq.github.io/</a>
        </div>
        <div className="about-page-section-table">
          <AboutTable versions={versions} />
        </div>
      </Panel>
    </div>
  );
};

export default AboutPage;
