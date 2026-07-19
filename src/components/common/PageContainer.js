import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Breadcrumb, Panel } from 'rsuite';

// Shared page chrome: wraps every routed page in a Panel and (optionally) a
// "Home / <page>" breadcrumb. Replaces the near-identical wrapper that each
// page folder's index.js used to duplicate.
const PageContainer = function ({ breadcrumbMessageId, children }) {
  return (
    <Panel>
      {breadcrumbMessageId && (
        <Breadcrumb>
          <Breadcrumb.Item href="/">
            <FormattedMessage id="page.home.bread-crumb" />
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <FormattedMessage id={breadcrumbMessageId} />
          </Breadcrumb.Item>
        </Breadcrumb>
      )}
      {children}
    </Panel>
  );
};

export default PageContainer;
