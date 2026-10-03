import React, { useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Toggle } from 'rsuite';
import { formatBytes, formatMilliseconds } from './attachmentFormat';

// More rows than this make the table sluggish; a HAR for one test is usually far smaller.
const MAX_ROWS = 2000;

// A request failed if the server answered with an error, or never answered at all.
// Browsers record a request that got no response (blocked, aborted, a network error) as
// status 0, and Playwright as -1.
const isFailed = (status) => status <= 0 || status >= 400;

const statusClass = (status) => {
  if (isFailed(status)) return 'status-fail';
  if (status >= 300) return 'status-info';
  return 'status-pass';
};

const parseHar = (text) => {
  try {
    const har = JSON.parse(text);
    if (!har || !har.log || !Array.isArray(har.log.entries)) return undefined;
    return har.log.entries.map((entry, index) => {
      const request = entry.request || {};
      const response = entry.response || {};
      const content = response.content || {};
      const size = content.size >= 0 ? content.size : response.bodySize;
      return {
        key: index,
        method: request.method || '',
        url: request.url || '',
        status: Number(response.status) || 0,
        type: (content.mimeType || '').split(';')[0],
        size: size >= 0 ? size : undefined,
        time: entry.time,
      };
    });
  } catch (error) {
    return undefined;
  }
};

/*
 * A HAR file as a table of requests, in the order they were made, with failed requests
 * highlighted and a toggle to show only those - usually the reason a test was looking
 * at the network in the first place.
 */
const HarViewer = function ({ text }) {
  const intl = useIntl();
  const entries = useMemo(() => parseHar(text), [text]);
  const [failedOnly, setFailedOnly] = useState(false);

  if (!entries) {
    return (
      <div className="app-alert app-alert-error">
        <FormattedMessage id="common.component.test-attachments.har.invalid" />
      </div>
    );
  }
  const failedCount = entries.filter((entry) => isFailed(entry.status)).length;
  const rows = (failedOnly ? entries.filter((entry) => isFailed(entry.status)) : entries)
    .slice(0, MAX_ROWS);

  return (
    <div className="test-attachment-har">
      <div className="test-attachment-har-toolbar">
        <span className="page-help-text">
          <FormattedMessage
            id="common.component.test-attachments.har.summary"
            values={{ count: entries.length, failed: failedCount }}
          />
        </span>
        <label className="test-attachment-har-toggle" htmlFor="har-failed-only">
          <Toggle id="har-failed-only" checked={failedOnly} onChange={setFailedOnly} size="sm" />
          <FormattedMessage id="common.component.test-attachments.har.failed-only" />
        </label>
      </div>
      { rows.length === 0 ? (
        <p className="page-help-text">
          <FormattedMessage id="common.component.test-attachments.har.empty" />
        </p>
      ) : (
        <div className="test-attachment-har-scroll">
          <table className="test-attachment-har-table">
            <thead>
              <tr>
                <th><FormattedMessage id="common.component.test-attachments.har.header.status" /></th>
                <th><FormattedMessage id="common.component.test-attachments.har.header.method" /></th>
                <th><FormattedMessage id="common.component.test-attachments.har.header.url" /></th>
                <th><FormattedMessage id="common.component.test-attachments.har.header.type" /></th>
                <th className="test-attachment-har-number">
                  <FormattedMessage id="common.component.test-attachments.har.header.size" />
                </th>
                <th className="test-attachment-har-number">
                  <FormattedMessage id="common.component.test-attachments.har.header.time" />
                </th>
              </tr>
            </thead>
            <tbody>
              { rows.map((entry) => (
                <tr key={entry.key} className={isFailed(entry.status) ? 'test-attachment-har-failed' : ''}>
                  <td className={statusClass(entry.status)}>
                    { entry.status > 0 ? entry.status : (
                      <FormattedMessage id="common.component.test-attachments.har.no-response" />
                    )}
                  </td>
                  <td>{entry.method}</td>
                  <td className="test-attachment-har-url" title={entry.url}>{entry.url}</td>
                  <td>{entry.type}</td>
                  <td className="test-attachment-har-number">{formatBytes(intl, entry.size)}</td>
                  <td className="test-attachment-har-number">{formatMilliseconds(intl, entry.time)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      { (failedOnly ? failedCount : entries.length) > MAX_ROWS ? (
        <p className="page-help-text">
          <FormattedMessage
            id="common.component.test-attachments.har.truncated"
            values={{ count: MAX_ROWS }}
          />
        </p>
      ) : null }
    </div>
  );
};

export default HarViewer;
