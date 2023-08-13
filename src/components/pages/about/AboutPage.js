import React, { useEffect, useState } from 'react';
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
      <div>
        Angles is an open-source framework to store results for
        automated test runs from various frameworks.
      </div>
      <br />
      <div>
        <span>By providing a clearly defined </span>
        <a href="src/components/pages/about/AboutPage?url=https://raw.githubusercontent.com/AnglesHQ/angles/master/swagger/swagger.json" rel="noreferrer" target="_blank">API</a>
        <span>
          &nbsp;any framework can be adapted to store its test result in Angles,
          using one of the clients provided (or by using the API directly)
        </span>
      </div>
      <br />
      <div>
        For more information about Angles go to page:
        <br />
        <a href="src/components/pages/about/AboutPage" rel="noreferrer" target="_blank">https://angleshq.github.io/</a>
      </div>
      <div>
        <AboutTable versions={versions} />
      </div>
    </div>
  );
};

export default AboutPage;
