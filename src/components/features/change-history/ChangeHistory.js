import React from 'react';
import PropTypes from 'prop-types';
import { Loader, Tag } from 'rsuite';
import Moment from 'react-moment';
import { FormattedMessage } from 'react-intl';

// The audit actions the API can record. Kept as a lookup so an unrecognised action still
// renders (as its raw value) rather than showing nothing.
const ACTION_LABELS = {
    CREATE: 'app.manual.history.action.create',
    UPDATE: 'app.manual.history.action.update',
    DELETE: 'app.manual.history.action.delete',
    CLONE: 'app.manual.history.action.clone',
    STATUS_CHANGE: 'app.manual.history.action.status-change',
    SHARED_STEP_UPDATE: 'app.manual.history.action.shared-step-update',
    ARCHIVE: 'app.manual.history.action.archive',
};

// A change value can be a string, number, boolean, date, array or an object (a step
// summary). Rendered as readable text rather than raw JSON wherever possible.
const formatValue = (value) => {
    if (value === undefined || value === null || value === '') return '—';
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'object') {
        return Object.entries(value)
            .map(([key, entry]) => `${key}: ${entry}`)
            .join(' · ');
    }
    return String(value);
};

/**
 * Timeline of who changed what on a test case or shared step.
 *
 * Distinct from the version list: a version is the content a tester saw, while this says
 * who changed it and why - including a status change that burns no version, and a case
 * re-versioned because somebody edited a shared step it includes.
 */
const ChangeHistory = ({ entries, loading }) => {
    if (loading) {
        return (
            <div className="app-alert app-alert-info">
                <Loader content={<FormattedMessage id="app.manual.history.loading" />} />
            </div>
        );
    }

    if (!entries || entries.length === 0) {
        return (
            <div className="app-alert app-alert-info">
                <FormattedMessage id="app.manual.history.empty" />
            </div>
        );
    }

    return (
        <ul className="change-history">
            {entries.map((entry) => (
                <li className="change-history-entry" key={entry._id}>
                    <div className="change-history-header">
                        <Tag className="change-history-action">
                            <FormattedMessage
                                id={ACTION_LABELS[entry.action] || 'app.manual.history.action.update'}
                            />
                        </Tag>
                        {entry.version !== undefined && entry.version !== null && (
                            <span className="change-history-version">
                                <FormattedMessage
                                    id="app.manual.version-badge.version"
                                    values={{ version: entry.version }}
                                />
                            </span>
                        )}
                        <span className="change-history-author">
                            {entry.changedBy && entry.changedBy.username
                                ? entry.changedBy.username
                                : <FormattedMessage id="app.manual.history.unknown-author" />}
                        </span>
                        <span className="change-history-date">
                            <Moment format="DD-MM-YYYY HH:mm">{entry.changedAt}</Moment>
                        </span>
                    </div>

                    {entry.comment && (
                        <div className="change-history-comment">{entry.comment}</div>
                    )}

                    {/* Names the shared step that caused a case to be re-versioned, so a
                        version bump nobody made directly is explained rather than mysterious. */}
                    {entry.causedBy && entry.causedBy.name && (
                        <div className="change-history-caused-by">
                            <FormattedMessage
                                id="app.manual.history.caused-by"
                                values={{ name: entry.causedBy.name }}
                            />
                        </div>
                    )}

                    {entry.changes && entry.changes.length > 0 && (
                        <ul className="change-history-changes">
                            {entry.changes.map((change, index) => (
                                // eslint-disable-next-line react/no-array-index-key
                                <li key={`${entry._id}-${change.field}-${index}`}>
                                    <span className="change-history-field">{change.field}</span>
                                    <span className="change-history-from">{formatValue(change.from)}</span>
                                    <span className="change-history-arrow">→</span>
                                    <span className="change-history-to">{formatValue(change.to)}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </li>
            ))}
        </ul>
    );
};

ChangeHistory.propTypes = {
    entries: PropTypes.array,
    loading: PropTypes.bool,
};

export default ChangeHistory;
