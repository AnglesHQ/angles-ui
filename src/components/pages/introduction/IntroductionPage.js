import React from 'react';
import {
  Panel,
} from 'rsuite';
import { FormattedMessage } from 'react-intl';

const IntroductionPage = function () {
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
        <div>Welcome to Angles</div>
      </Panel>
    </div>
  );
};

export default IntroductionPage;
