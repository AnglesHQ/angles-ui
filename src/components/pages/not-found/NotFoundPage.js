import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Panel } from 'rsuite';

const NotFoundPage = function () {
  return (
    <div>
      <Panel
        bordered
        className="page-panel"
        header={(
          <span className="page-panel-header">
            <FormattedMessage id="page.not-found.header" />
          </span>
        )}
      >
        <div className="page-section">
          <span>
            <FormattedMessage
              id="page.not-found.description"
              values={{
                homeLink: (
                  <a href="/" target="_self">
                    <FormattedMessage id="page.not-found.home-link-text" />
                  </a>
                ),
              }}
            />
          </span>
        </div>
      </Panel>
    </div>
  );
};

export default NotFoundPage;
