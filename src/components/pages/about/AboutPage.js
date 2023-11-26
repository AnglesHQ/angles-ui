import React, { useEffect, useState } from 'react';
import {
  Panel,
} from 'rsuite';
import { FormattedMessage } from 'react-intl';
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
        header={(
          <span className="about-page-header">
            <FormattedMessage id="page.about.header" />
          </span>
        )}
      >
        <div className="about-page-section">
          <span>
            <FormattedMessage id="page.about.about-angles" />
          </span>
        </div>
        <div className="about-page-section">
          <span>
            <FormattedMessage
              id="page.about.about-api"
              values={{
                // TODO: fix link
                apiLink: <a href="src/components/pages/about/AboutPage?url=https://raw.githubusercontent.com/AnglesHQ/angles/master/swagger/swagger.json" rel="noreferrer" target="_blank"> API </a>,
              }}
            />
          </span>
        </div>
        <div className="about-page-section">
          <FormattedMessage
            id="page.about.about-github"
            values={{
              githubLink: <a href="https://angleshq.github.io/" rel="noreferrer" target="_blank"> https://angleshq.github.io/</a>,
            }}
          />
        </div>
        <div className="about-page-section-table">
          <AboutTable versions={versions} />
        </div>
      </Panel>
    </div>
  );
};

export default AboutPage;
