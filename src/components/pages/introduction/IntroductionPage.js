import React from 'react';
import {
  Panel,
} from 'rsuite';
import { FormattedMessage } from 'react-intl';

const IntroductionPage = function () {
  const getSwaggerUrl = function () {
    return `${process.env.REACT_APP_ANGLES_API_URL}/api-docs`;
  };

  return (
    <div>
      <Panel
        bordered
        className="introduction-page-panel"
        header={(
          <span className="introduction-page-header">
            <FormattedMessage id="page.introduction.header" />
          </span>
        )}
      >
        <div className="introduction-main-div">
          <div>
            <FormattedMessage
              id="page.introduction.description"
              values={{
                apiLink: (
                  <a href={getSwaggerUrl()} target="_blank" rel="noopener noreferrer">
                    <FormattedMessage id="page.introduction.api-link-text" />
                  </a>
                ),
              }}
            />
          </div>
          <div className="introduction-alternative-description">
            <FormattedMessage
              id="page.introduction.description-alternative"
              values={{
                githubLink: (
                  <a href="https://angleshq.github.io/" target="_blank" rel="noopener noreferrer">
                    <FormattedMessage id="page.introduction.github-link-text" />
                  </a>
                ),
              }}
            />
          </div>
        </div>
      </Panel>
    </div>
  );
};

export default IntroductionPage;
