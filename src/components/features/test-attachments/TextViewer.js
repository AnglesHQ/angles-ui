import React, { useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Input, InputGroup } from 'rsuite';
import SearchIcon from '@rsuite/icons/Search';

// Rendering more lines than this makes the modal sluggish; the rest is a download away.
const MAX_LINES = 5000;

const prettyJson = (text) => {
  try {
    return JSON.stringify(JSON.parse(text), null, 2);
  } catch (error) {
    return text;
  }
};

/*
 * A log or JSON file as numbered lines, with a filter that keeps only the lines
 * containing the search text (case-insensitive). Line numbers stay those of the file, so a
 * filtered view still says where each line is.
 */
const TextViewer = function ({ text, json }) {
  const intl = useIntl();
  const [filter, setFilter] = useState('');
  const lines = useMemo(() => (json ? prettyJson(text) : text).split(/\r?\n/), [text, json]);
  const term = filter.trim().toLowerCase();

  const matching = useMemo(() => lines
    .map((line, index) => ({ line, number: index + 1 }))
    .filter(({ line }) => !term || line.toLowerCase().includes(term)), [lines, term]);
  const shown = matching.slice(0, MAX_LINES);

  return (
    <div className="test-attachment-text">
      <InputGroup inside className="test-attachment-text-filter">
        <Input
          value={filter}
          onChange={setFilter}
          placeholder={intl.formatMessage({ id: 'common.component.test-attachments.text.filter' })}
        />
        <InputGroup.Addon><SearchIcon /></InputGroup.Addon>
      </InputGroup>
      { term ? (
        <p className="page-help-text">
          <FormattedMessage
            id="common.component.test-attachments.text.match-count"
            values={{ count: matching.length, total: lines.length }}
          />
        </p>
      ) : null }
      { shown.length === 0 ? (
        <p className="page-help-text">
          <FormattedMessage id="common.component.test-attachments.text.no-matches" />
        </p>
      ) : (
        <pre className="test-attachment-text-lines">
          { shown.map(({ line, number }) => (
            <div className="test-attachment-text-line" key={number}>
              <span className="test-attachment-text-number">{number}</span>
              <code>{line}</code>
            </div>
          ))}
        </pre>
      )}
      { matching.length > MAX_LINES ? (
        <p className="page-help-text">
          <FormattedMessage
            id="common.component.test-attachments.text.truncated"
            values={{ count: MAX_LINES }}
          />
        </p>
      ) : null }
    </div>
  );
};

export default TextViewer;
