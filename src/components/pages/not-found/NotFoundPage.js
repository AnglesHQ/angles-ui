import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Panel } from 'rsuite';
import Message from '../../common/Message';

const NotFoundPage = function () {
  return (
    <Panel
      header={<h3 className="title">404</h3>}
    >
      <Message
        type="warning"
        message={(
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
        )}
      />
    </Panel>
  );
};

export default NotFoundPage;
