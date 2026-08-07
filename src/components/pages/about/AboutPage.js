import React, { useEffect, useState } from 'react';
import {
  Panel,
} from 'rsuite';
import { FormattedMessage } from 'react-intl';
import axios from 'axios';
import { AnglesRequests } from 'angles-javascript-client';
import AboutTable from './AboutTable';
import { getAnglesApiBaseUrl } from '../../../utils/runtime-config';

const AboutPage = function () {
  const [versions, setVersions] = useState(null);
  // Resolved after mount so the server-rendered href matches the first client
  // render (the runtime config is only available in the browser).
  const [apiBaseUrl, setApiBaseUrl] = useState('');
  const anglesRequests = new AnglesRequests(axios);

  useEffect(() => {
    setApiBaseUrl(getAnglesApiBaseUrl());
  }, []);

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
        className="page-panel"
        header={(
          <span className="page-panel-header">
            <FormattedMessage id="page.about.header" />
          </span>
        )}
      >
        <div className="page-section">
          <span>
            <FormattedMessage id="page.about.about-angles" />
          </span>
        </div>
        <div className="page-section">
          <span>
            <FormattedMessage
              id="page.about.about-api"
              values={{
                // TODO: fix link
                apiLink: <a href={`${apiBaseUrl}/api-docs`} rel="noreferrer" target="_blank"> API </a>,
              }}
            />
          </span>
        </div>
        <div className="page-section">
          <FormattedMessage
            id="page.about.about-github"
            values={{
              githubLink: <a href="https://angleshq.github.io/" rel="noreferrer" target="_blank"> https://angleshq.github.io/</a>,
            }}
          />
        </div>
        <div className="page-section-table">
          <AboutTable versions={versions} />
        </div>
      </Panel>
    </div>
  );
};

export default AboutPage;
