import React from 'react';
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
            Oops, we were unable to find the &quot;Angle&quot; you were looking for. Click
            <a href="/" target="_self"> here </a>
            to go back to home page.
          </span>
        )}
      />
    </Panel>
  );
};

export default NotFoundPage;
